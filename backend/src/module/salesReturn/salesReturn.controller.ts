import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createSalesReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const { saleId, branchId, date, invoiceNo, paymentAccountId, products } =
      req.body;
    const salesReturnDate = new Date(date);
    const findSales = await prisma.sale.findUnique({ where: { id: saleId } });

    if (!findSales) {
      throw new Error("Sales not found");
    }

    const alreadyReturn = await prisma.salesReturn.findFirst({
      where: {
        saleId,
      },
    });

    if (alreadyReturn) {
      throw new Error("This sale has already been returned.");
    }

    const purchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Total amount & due
      const productsTotal = products.reduce(
        (sum: any, p: any) => sum + p.quantity * p.unitPrice,
        0,
      );
      const totalAmount = productsTotal;
      const totalPaymentAmount = totalAmount;

      // 2️⃣ Fetch supplier & payment account
      const [customer, paymentAccount] = await Promise.all([
        tx.particular.findUnique({ where: { id: findSales.customerId } }),
        tx.particular.findUnique({ where: { id: paymentAccountId } }),
      ]);
      if (!customer) throw new Error("Customer not found");
      if (!paymentAccount) throw new Error("Payment account not found");

      // 3️⃣ Create sales return
      const salesReturnRecord = await tx.salesReturn.create({
        data: {
          branchId,
          date: salesReturnDate,
          invoiceNo,
          customerId: findSales.customerId,
          paymentAccountId,
          totalAmount,
          totalPaymentAmount,
          saleId,
        },
      });

      const salesProductPromises = products.map(async (p: any) => {
        await tx.salesReturnProduct.create({
          data: {
            branchId,
            salesReturnId: salesReturnRecord.id,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            damageQuantity: p.damageQuantity || 0,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
          },
        });

        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar)
          throw new Error(
            `ProductVariation ID ${p.variationProductId} not found`,
          );

        const totalStock = (productVar.stockQuantity || 0) + p.quantity;
        const totalDamage =
          (productVar.damageQuantity || 0) + (p.damageQuantity || 0);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: totalStock, damageQuantity: totalDamage },
        });
      });
      await Promise.all(salesProductPromises);

      // 5️⃣ Create Voucher
      const lastVoucher = await tx.voucher.findFirst({
        where: { branchId },
        orderBy: { id: "desc" },
      });
      const voucherNo = `VCH-${branchId}-${(lastVoucher?.id || 0) + 1}`;

      const voucher = await tx.voucher.create({
        data: {
          branchId,
          salesReturnId: salesReturnRecord.id,
          voucherNo,
          type: "SALES_RETURN",
          date: salesReturnDate,
          narration: `Sales Return ${invoiceNo} from customer ID ${findSales.customerId}`,
        },
      });

      // 6️⃣ Accounting Entries

      const inventoryLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Sales" },
        include: { particulars: { take: 1 } },
      });
      if (!inventoryLedger || !inventoryLedger.particulars[0])
        throw new Error("Inventory ledger/particular not found");

      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: inventoryLedger.particulars[0].id,
          type: "Debit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: inventoryLedger.particulars[0].id },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: inventoryLedger.id },
        data: { balance: { decrement: totalAmount } },
      });

      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: customer.id,
          type: "Credit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: customer.id },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: customer.ledgerId },
        data: { balance: { decrement: totalAmount } },
      });

      // c) Payment made immediately
      if (totalPaymentAmount > 0) {
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: customer.id,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: customer.id },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: customer.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });

        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccount.id,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccount.id },
          data: { balance: { decrement: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: paymentAccount.ledgerId },
          data: { balance: { decrement: totalPaymentAmount } },
        });
      }

      // 7️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId: req.user?.id || null,
          action: "CREATE",
          description: `Sales Return voucher created for challan ${invoiceNo} with ${products.length} products`,
          data: { sales: salesReturnRecord, products },
        },
      });

      await prisma.salesReturnLog.create({
        data: {
          branchId: salesReturnRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          saleReturnId: salesReturnRecord.id,
          data: { sales: salesReturnRecord, products },
          action: "CREATED",
        },
      });

      return salesReturnRecord;
    });

    return res.status(201).json({
      success: true,
      message: "Sales Return created successfully",
      data: purchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSalesReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const salesReturnId = Number(req.params.id);
    const { branchId, date, invoiceNo, paymentAccountId, products } = req.body;
    const purchaseDate = new Date(date);

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing purchase
      const existingSales = await tx.salesReturn.findUnique({
        where: { id: salesReturnId },
        include: { salesReturnProducts: true, customer: true },
      });
      if (!existingSales) throw new Error("Sales Return not found");

      // 2️⃣ Revert old ProductVariation stock & purchasePrice
      for (const p of existingSales.salesReturnProducts) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        const oldStock = productVar.stockQuantity - p.quantity;
        const oldDamage = productVar.damageQuantity - p.damageQuantity;
        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: oldStock, damageQuantity: oldDamage },
        });
      }

      // 3️⃣ Revert old accounting entries (with ledger nature)
      const oldEntries = await tx.particularOnVoucher.findMany({
        where: { voucher: { salesReturnId: salesReturnId } },
        include: {
          particular: { include: { ledger: { include: { group: true } } } },
        },
      });
      for (const entry of oldEntries) {
        const particular = entry.particular;
        const ledger = entry.particular.ledger;
        const ledgerType = entry.particular.ledger.group.account; // Asset, Liability, Expense, Income
        let updateData: any;

        if (entry.type === "Debit") {
          if (ledgerType === "Assets" || ledgerType === "Expense")
            updateData = { decrement: entry.amount };
          else updateData = { increment: entry.amount };
        } else {
          if (ledgerType === "Assets" || ledgerType === "Expense")
            updateData = { increment: entry.amount };
          else updateData = { decrement: entry.amount };
        }

        await tx.particular.update({
          where: { id: particular.id },
          data: { balance: updateData },
        });
        if (ledger)
          await tx.ledger.update({
            where: { id: ledger.id },
            data: { balance: updateData },
          });
      }

      // 4️⃣ Delete old voucher entries
      await tx.particularOnVoucher.deleteMany({
        where: { voucher: { salesReturnId: salesReturnId } },
      });
      await tx.salesReturnProduct.deleteMany({
        where: { salesReturnId: salesReturnId },
      });

      // 5️⃣ Update Purchase main record
      const productsTotal = products.reduce(
        (sum: any, p: any) => sum + p.quantity * p.unitPrice,
        0,
      );
      const totalAmount = productsTotal;
      const totalPaymentAmount = totalAmount;

      const updatedPurchaseRecord = await tx.salesReturn.update({
        where: { id: salesReturnId },
        data: {
          branchId,
          date: purchaseDate,
          invoiceNo,
          customerId: existingSales.customerId,
          paymentAccountId,
          totalAmount,
          totalPaymentAmount,
        },
      });

      const salesProductPromises = products.map(async (p: any) => {
        await tx.salesReturnProduct.create({
          data: {
            branchId,
            salesReturnId: existingSales.id,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            damageQuantity: p.damageQuantity || 0,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
          },
        });

        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar)
          throw new Error(
            `ProductVariation ID ${p.variationProductId} not found`,
          );

        const totalStock = (productVar.stockQuantity || 0) + p.quantity;
        const totalDamage =
          (productVar.damageQuantity || 0) + (p.damageQuantity || 0);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: totalStock, damageQuantity: totalDamage },
        });
      });
      await Promise.all(salesProductPromises);

      const findVoucher = await tx.voucher.findFirst({
        where: { salesReturnId: salesReturnId },
      });
      if (!findVoucher) {
        throw new Error(`Previous voucher not found`);
      }
      const voucher = await tx.voucher.update({
        where: {
          id: findVoucher.id,
        },
        data: {
          branchId,
          salesReturnId,
          type: "SALES_RETURN",
          date: purchaseDate,
          narration: `Sales Return ${invoiceNo} from customer ID ${existingSales.customerId}`,
        },
      });
      const paymentAccount = await tx.particular.findUnique({
        where: { id: paymentAccountId },
      });
      const inventoryLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Sales" },
        include: { particulars: { take: 1 } },
      });
      if (!inventoryLedger || !inventoryLedger.particulars[0])
        throw new Error("Inventory ledger/particular not found");
      if (!paymentAccount) throw new Error("Payment account not found");
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: inventoryLedger.particulars[0].id,
          type: "Debit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: inventoryLedger.particulars[0].id },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: inventoryLedger.id },
        data: { balance: { decrement: totalAmount } },
      });

      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: existingSales.customerId,
          type: "Credit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: existingSales.customerId },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: existingSales.customer.ledgerId },
        data: { balance: { decrement: totalAmount } },
      });

      // c) Payment made immediately
      if (totalPaymentAmount > 0) {
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: existingSales.customerId,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: existingSales.customerId },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: existingSales.customer.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });

        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccount.id,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccount.id },
          data: { balance: { decrement: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: paymentAccount.ledgerId },
          data: { balance: { decrement: totalPaymentAmount } },
        });
      }

      // 8️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId: req.user?.id || null,
          action: "UPDATE",
          description: `Sales Return voucher updated for challan ${invoiceNo} with ${products.length} products`,
          data: { salesReturn: updatedPurchaseRecord, products },
        },
      });

      await prisma.salesReturnLog.create({
        data: {
          branchId: updatedPurchaseRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          saleReturnId: updatedPurchaseRecord.id,
          data: { salesReturn: updatedPurchaseRecord, products },
          action: "UPDATED",
        },
      });
      return updatedPurchaseRecord;
    });

    return res.status(200).json({
      success: true,
      message: "Sales Return updated successfully",
      data: updatedPurchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSalesReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const salesReturnId = req.params.id;

    const deletedSales = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch purchase with products and voucher
      const sales = await tx.salesReturn.findUnique({
        where: { id: Number(salesReturnId) },
        include: {
          salesReturnProducts: true,
        },
      });
      if (!sales) throw new Error("Sales Return not found");

      // 2️⃣ Revert ProductVariation stock & purchasePrice
      for (const p of sales.salesReturnProducts) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        const oldStock = productVar.stockQuantity - p.quantity;
        const oldDamage = productVar.damageQuantity - (p.damageQuantity || 0);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: oldStock, damageQuantity: oldDamage },
        });
      }
      const findVoucher = await tx.voucher.findFirst({
        where: {
          salesReturnId: Number(salesReturnId),
        },
      });
      // 3️⃣ Revert accounting entries
      if (findVoucher) {
        const oldEntries = await tx.particularOnVoucher.findMany({
          where: { voucher: { salesReturnId: Number(salesReturnId) } },
          include: {
            particular: { include: { ledger: { include: { group: true } } } },
          },
        });

        for (const entry of oldEntries) {
          const particular = entry.particular;
          const ledger = particular.ledger;
          const ledgerType = ledger.group.account;

          let updateData: any;
          if (entry.type === "Debit") {
            if (ledgerType === "Assets" || ledgerType === "Expense")
              updateData = { decrement: entry.amount };
            else updateData = { increment: entry.amount };
          } else {
            if (ledgerType === "Assets" || ledgerType === "Expense")
              updateData = { increment: entry.amount };
            else updateData = { decrement: entry.amount };
          }

          await tx.particular.update({
            where: { id: particular.id },
            data: { balance: updateData },
          });
          if (ledger)
            await tx.ledger.update({
              where: { id: ledger.id },
              data: { balance: updateData },
            });
        }

        // 4️⃣ Delete voucher entries
        await tx.particularOnVoucher.deleteMany({
          where: {
            voucher: {
              salesReturnId: Number(salesReturnId),
            },
          },
        });
        await tx.voucher.deleteMany({
          where: { salesReturnId: Number(salesReturnId) },
        });
      }

      // 5️⃣ Delete purchase products
      await tx.salesReturnProduct.deleteMany({
        where: { salesReturnId: sales.id },
      });

      // 6️⃣ Delete main purchase record
      await tx.salesReturn.delete({ where: { id: sales.id } });

      // 7️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: findVoucher?.id || 0,
          branchId: sales.branchId,
          userId: req.user?.id || null,
          action: "DELETE",
          description: `Sales Return deleted for challan ${sales.invoiceNo} with ${sales.salesReturnProducts.length} products`,
          data: { sales },
        },
      });

      await prisma.salesReturnLog.create({
        data: {
          branchId: sales.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          saleReturnId: sales.id,
          data: { sales, products: sales.salesReturnProducts },
          action: "DELETED",
        },
      });

      return sales;
    });

    return res
      .status(200)
      .json({ success: true, message: "Sales Return deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSalesReturnAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";
    if (skip < 0) skip = 0;

    const whereCondition: Prisma.SalesReturnWhereInput[] = [];
    if (search) {
      whereCondition.push({
        OR: [
          { invoiceNo: { contains: search as string } },
          { customer: { accountType: { contains: search as string } } },
        ],
      });
    }

    const result = await prisma.salesReturn.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      include: {
        customer: {
          select: {
            accountType: true,
          },
        },
      },
      skip: skip * take,
      take,
      orderBy: { date: order },
    });

    const total = await prisma.salesReturn.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sales Return retrieved successfully",
      meta: {
        page,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get purchase by ID
export const getSalesReturnById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = Number(req.params.id);
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Sales Return ID is missing in the request parameters",
      });
    }

    const result = await prisma.salesReturn.findFirst({
      where: { id: purchaseId },
      include: {
        salesReturnProducts: {
          include: {
            productVariation: {
              include: {
                product: {
                  include: {
                    brand: true,
                    category: true,
                    subCategory: true,
                    unit: true,
                  },
                },
                size: true,
                color: true,
              },
            },
          },
        },
        customer: true,
        account: true,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sales Return not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sales Return retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

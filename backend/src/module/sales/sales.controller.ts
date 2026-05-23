import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    branchId,
    date,
    invoiceNo,
    customerId,
    paymentAccountId,
    totalPaymentAmount,
    vat = 0,
    discount = 0,
    tc = 0,
    products,
  } = req.body;

  try {
    const { id } = req.user;
    const result = await prisma.$transaction(async (tx) => {
      const saleDate = new Date(date);

      // 🧾 1️⃣ Create Sale record
      const totalAmount = products.reduce(
        (sum: any, p: any) => sum + p.unitPrice * p.quantity,
        0,
      );
      const finalTotalAmount = totalAmount + vat + tc - discount;
      const dueAmount = finalTotalAmount - totalPaymentAmount;

      const sale = await tx.sale.create({
        data: {
          branchId,
          date: saleDate,
          invoiceNo,
          customerId,
          paymentAccountId,
          totalAmount: finalTotalAmount,
          totalPaymentAmount,
          dueAmount,
          vat,
          tc,
          discount,
        },
      });
      let totalCOGS = 0;
      // 🧮 2️⃣ Insert SaleProduct + Update Stock (Decrease)
      for (const p of products) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
          select: { stockQuantity: true, purchasePrice: true },
        });

        if (!productVar) {
          throw new Error(
            `Product variation ${p.variationProductId} not found`,
          );
        }

        if (productVar.stockQuantity < p.quantity) {
          throw new Error(
            `Insufficient stock for product ${p.variationProductId}`,
          );
        }

        const newStock = productVar.stockQuantity - p.quantity;

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: newStock },
        });

        await tx.saleProduct.create({
          data: {
            saleId: sale.id,
            branchId,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subTotal: p.unitPrice * p.quantity,
          },
        });
        totalCOGS += (productVar.purchasePrice || 0) * p.quantity;
      }

      // 🔎 4️⃣ Get Customer + PaymentAccount + SalesLedger
      const getAccountType = (id: number) =>
        tx.particular.findUnique({
          where: { id },
          select: {
            id: true,
            ledgerId: true,
            balance: true,
            accountType: true,
            ledger: {
              select: {
                group: {
                  select: { account: true },
                },
              },
            },
          },
        });

      const [customer, paymentAccount] = await Promise.all([
        getAccountType(customerId),
        getAccountType(paymentAccountId),
      ]);

      if (!customer) {
        throw new Error("Customer not found");
      }

      if (!paymentAccount) {
        throw new Error("Payment account not found");
      }

      // 🧾 3️⃣ Create Voucher (Type: SALES)
      const voucher = await tx.voucher.create({
        data: {
          branchId,
          type: "SALES",
          date: saleDate,
          saleId: sale.id,
          voucherNo: invoiceNo,
          narration: `Sale ${invoiceNo} to customer ${customer?.accountType}`,
        },
      });

      const customerAccountType = customer?.ledger?.group?.account;
      const paymentAccountType = paymentAccount?.ledger?.group?.account;

      if (!customerAccountType) {
        throw new Error("Customer ledger configuration invalid");
      }

      if (!paymentAccountType) {
        throw new Error("Payment account ledger configuration invalid");
      }

      if (customerAccountType !== "Assets") {
        throw new Error(
          "Customer must belong to Asset group (Accounts Receivable)",
        );
      }

      if (paymentAccountType !== "Assets") {
        throw new Error(
          "Payment account must belong to Asset group (Cash/Bank)",
        );
      }

      // 🧾 5️⃣ Voucher Entries
      // a) Debit Customer (they owe you)
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: customer.id,
          type: "Debit",
          amount: finalTotalAmount,
        },
      });

      await tx.particular.update({
        where: { id: customer.id },
        data: { balance: { increment: finalTotalAmount } },
      });
      await tx.ledger.update({
        where: { id: customer.ledgerId },
        data: { balance: { increment: finalTotalAmount } },
      });

      const salesLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Sales" },
        select: { id: true, particulars: true },
      });

      if (!salesLedger)
        throw new Error("Sales ledger not configured for branch");

      // b) Credit Sales Ledger (income increases)
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: salesLedger.particulars[0].id,
          type: "Credit",
          amount: finalTotalAmount,
        },
      });

      await tx.particular.update({
        where: { id: salesLedger.particulars[0].id },
        data: { balance: { increment: finalTotalAmount } },
      });
      await tx.ledger.update({
        where: { id: salesLedger.id },
        data: { balance: { increment: finalTotalAmount } },
      });

      if (totalCOGS > 0) {
        // Get Inventory Ledger
        const inventoryLedger = await tx.ledger.findFirst({
          where: { branchId, ledgerType: "Inventory" },
          include: { particulars: { take: 1 } },
        });
        if (!inventoryLedger || !inventoryLedger.particulars[0])
          throw new Error("Inventory ledger not found");

        // Debit COGS Ledger
        const cogsLedger = await tx.ledger.findFirst({
          where: { branchId, ledgerType: "COGS" },
          include: { particulars: { take: 1 } },
        });

        if (!cogsLedger || !cogsLedger.particulars[0])
          throw new Error("COGS ledger not found");

        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: cogsLedger.particulars[0].id,
            type: "Debit",
            amount: totalCOGS,
          },
        });
        await tx.particular.update({
          where: { id: cogsLedger.particulars[0].id },
          data: { balance: { increment: totalCOGS } },
        });
        await tx.ledger.update({
          where: { id: cogsLedger.id },
          data: { balance: { increment: totalCOGS } },
        });

        // Credit Inventory Ledger
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: inventoryLedger.particulars[0].id,
            type: "Credit",
            amount: totalCOGS,
          },
        });
        await tx.particular.update({
          where: { id: inventoryLedger.particulars[0].id },
          data: { balance: { decrement: totalCOGS } },
        });

        await tx.ledger.update({
          where: { id: inventoryLedger.id },
          data: { balance: { decrement: totalCOGS } },
        });
      }

      // 💰 6️⃣ Payment entry (if any)
      if (totalPaymentAmount > 0) {
        // c) Credit Customer (reduce receivable)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: customer.id,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: customer.id },
          data: { balance: { decrement: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: customer.ledgerId },
          data: { balance: { decrement: totalPaymentAmount } },
        });

        // d) Debit Payment Account (cash/bank increases)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccountId,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccountId },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: paymentAccount.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });
      }

      // 🧾 7️⃣ Audit Log
      await tx.voucherAudit.create({
        data: {
          userId: req.user.id,
          voucherId: voucher.id,
          branchId,
          action: "CREATE",
          data: { sale, voucher },
          description: `Sales voucher created for invoice ${invoiceNo}`,
        },
      });
      await tx.salesLog.create({
        data: {
          branchId: sale.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          saleId: sale.id,
          data: { sale, products },
          action: "UPDATED",
        },
      });

      return { sale, voucher };
    });

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const saleId = Number(req.params.id);
    const {
      branchId,
      date,
      invoiceNo,
      customerId,
      paymentAccountId,
      totalPaymentAmount,
      vat = 0,
      discount = 0,
      tc = 0,
      products,
    } = req.body;
    const { id } = req.user;
    const saleDate = new Date(date);

    const updatedSale = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing sale
      const existingSale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { SaleProduct: true },
      });
      if (!existingSale) throw new Error("Sale not found");

      // 2️⃣ Rollback old product stock
      await Promise.all(
        existingSale.SaleProduct.map((p) =>
          tx.productVariation.update({
            where: { id: p.variationProductId },
            data: {
              stockQuantity: { increment: p.quantity },
            },
          }),
        ),
      );

      // 3️⃣ Rollback old accounting entries
      const oldEntries = await tx.particularOnVoucher.findMany({
        where: { voucher: { saleId: saleId } },
        include: {
          particular: { include: { ledger: { include: { group: true } } } },
        },
      });

      const updatePromises: any[] = [];

      for (const entry of oldEntries) {
        const ledgerType = entry.particular.ledger?.group?.account || "Other";

        let updateData: any;

        if (entry.type === "Debit") {
          updateData = ["Assets", "Expense"].includes(ledgerType)
            ? { decrement: entry.amount }
            : { increment: entry.amount };
        } else {
          updateData = ["Assets", "Expense"].includes(ledgerType)
            ? { increment: entry.amount }
            : { decrement: entry.amount };
        }

        updatePromises.push(
          tx.particular.update({
            where: { id: entry.particularId },
            data: { balance: updateData },
          }),
        );

        if (entry.particular.ledgerId) {
          updatePromises.push(
            tx.ledger.update({
              where: { id: entry.particular.ledgerId },
              data: { balance: updateData },
            }),
          );
        }
      }

      await Promise.all(updatePromises);

      const voucherId = oldEntries[0]?.voucherId;
      // 4️⃣ Delete old voucher entries & SaleProduct
      await tx.particularOnVoucher.deleteMany({
        where: { voucher: { saleId: saleId } },
      });
      await tx.saleProduct.deleteMany({ where: { saleId } });

      // 5️⃣ Update sale main record
      const totalAmountCalc = products.reduce(
        (sum: any, p: any) => sum + p.unitPrice * p.quantity,
        0,
      );
      const finalTotalAmount = totalAmountCalc + vat + tc - discount;
      const dueAmount = finalTotalAmount - totalPaymentAmount;

      const updatedSaleRecord = await tx.sale.update({
        where: { id: saleId },
        data: {
          branchId,
          date: saleDate,
          invoiceNo,
          customerId,
          paymentAccountId,
          totalAmount: finalTotalAmount,
          totalPaymentAmount,
          dueAmount,
          vat,
          tc,
          discount,
        },
      });

      let totalCOGS = 0;
      // 6️⃣ Insert new SaleProduct + update stock
      for (const p of products) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar)
          throw new Error(`ProductVariation ${p.variationProductId} not found`);

        if (productVar.stockQuantity < p.quantity)
          throw new Error(`Insufficient stock for ${p.variationProductId}`);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: productVar.stockQuantity - p.quantity },
        });

        await tx.saleProduct.create({
          data: {
            saleId,
            branchId,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
          },
        });
        totalCOGS += (productVar.purchasePrice || 0) * p.quantity;
      }

      // 8️⃣ Create accounting entries
      const customer = await tx.particular.findUnique({
        where: { id: customerId },
        include: { ledger: { include: { group: true } } },
      });
      if (!customer) throw new Error("Customer not found");

      // 7️⃣ Update Voucher
      const voucher = await tx.voucher.update({
        where: { id: voucherId },
        data: {
          branchId,
          type: "SALES",
          date: saleDate,
          voucherNo: invoiceNo,
          narration: `Sale ${invoiceNo} to customer: ${customer?.accountType}`,
        },
      });

      const paymentAccount = await tx.particular.findUnique({
        where: { id: paymentAccountId },
        include: { ledger: { include: { group: true } } },
      });
      if (!paymentAccount) throw new Error("Payment account not found");
      if (
        customer.ledger.group.account !== "Assets" ||
        paymentAccount.ledger.group.account !== "Assets"
      )
        throw new Error(
          "Customer and payment account must be in the Assets ledger group",
        );
      const salesLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Sales" },
        include: { particulars: { take: 1 } },
      });
      if (!salesLedger || !salesLedger.particulars[0])
        throw new Error("Sales ledger not found");

      // a) Debit Customer
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: customer.id,
          type: "Debit",
          amount: finalTotalAmount,
        },
      });
      await tx.particular.update({
        where: { id: customer.id },
        data: { balance: { increment: finalTotalAmount } },
      });
      await tx.ledger.update({
        where: { id: customer.ledgerId },
        data: { balance: { increment: finalTotalAmount } },
      });

      // b) Credit Sales Ledger
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: salesLedger.particulars[0].id,
          type: "Credit",
          amount: finalTotalAmount,
        },
      });
      await tx.particular.update({
        where: { id: salesLedger.particulars[0].id },
        data: { balance: { increment: finalTotalAmount } },
      });
      await tx.ledger.update({
        where: { id: salesLedger.id },
        data: { balance: { increment: finalTotalAmount } },
      });

      if (totalCOGS > 0) {
        // Get Inventory Ledger
        const inventoryLedger = await tx.ledger.findFirst({
          where: { branchId, ledgerType: "Inventory" },
          include: { particulars: { take: 1 } },
        });
        if (!inventoryLedger || !inventoryLedger.particulars[0])
          throw new Error("Inventory ledger not found");

        // Debit COGS Ledger
        const cogsLedger = await tx.ledger.findFirst({
          where: { branchId, ledgerType: "COGS" },
          include: { particulars: { take: 1 } },
        });
        if (!cogsLedger || !cogsLedger.particulars[0])
          throw new Error("COGS ledger not found");

        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: cogsLedger.particulars[0].id,
            type: "Debit",
            amount: totalCOGS,
          },
        });
        await tx.particular.update({
          where: { id: cogsLedger.particulars[0].id },
          data: { balance: { increment: totalCOGS } },
        });
        await tx.ledger.update({
          where: { id: cogsLedger.id },
          data: { balance: { increment: totalCOGS } },
        });

        // Credit Inventory Ledger
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: inventoryLedger.particulars[0].id,
            type: "Credit",
            amount: totalCOGS,
          },
        });
        await tx.particular.update({
          where: { id: inventoryLedger.particulars[0].id },
          data: { balance: { decrement: totalCOGS } },
        });
        await tx.ledger.update({
          where: { id: inventoryLedger.id },
          data: { balance: { decrement: totalCOGS } },
        });
      }
      // c) Payment (if any)
      if (totalPaymentAmount > 0) {
        // Debit Payment Account
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccountId,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccountId },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: paymentAccount.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });

        // Credit Customer
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: customer.id,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: customer.id },
          data: { balance: { decrement: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: customer.ledgerId },
          data: { balance: { decrement: totalPaymentAmount } },
        });
      }

      // 9️⃣ Audit log
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId: req.user?.id || null,
          action: "UPDATE",
          description: `Sale updated for invoice ${invoiceNo}`,
          data: { sale: updatedSaleRecord, products },
        },
      });

      await tx.salesLog.create({
        data: {
          branchId: updatedSaleRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          saleId: updatedSaleRecord.id,
          data: { sale: updatedSaleRecord, products },
          action: "UPDATED",
        },
      });

      return updatedSaleRecord;
    });

    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const saleId = Number(req.params.id);
    const { id } = req.user;

    const deleteSale = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing sale
      const existingSale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { SaleProduct: true },
      });
      if (!existingSale) throw new Error("Sale not found");

      // 2️⃣ Rollback old product stock
      for (const p of existingSale.SaleProduct) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: productVar.stockQuantity + p.quantity },
        });
      }

      // 3️⃣ Rollback old accounting entries
      const oldEntries = await tx.particularOnVoucher.findMany({
        where: { voucher: { saleId: saleId } },
        include: {
          particular: { include: { ledger: { include: { group: true } } } },
        },
      });

      for (const entry of oldEntries) {
        const ledgerType = entry.particular.ledger?.group?.account || "Other";
        let updateData: any;

        if (entry.type === "Debit") {
          if (["Assets", "Expense"].includes(ledgerType))
            updateData = { decrement: entry.amount };
          else updateData = { increment: entry.amount };
        } else {
          if (["Assets", "Expense"].includes(ledgerType))
            updateData = { increment: entry.amount };
          else updateData = { decrement: entry.amount };
        }

        await tx.particular.update({
          where: { id: entry.particularId },
          data: { balance: updateData },
        });
        if (entry.particular.ledger) {
          await tx.ledger.update({
            where: { id: entry.particular.ledgerId },
            data: { balance: updateData },
          });
        }
      }
      const voucherId = oldEntries[0]?.voucherId;
      // 4️⃣ Delete old voucher entries & SaleProduct
      await tx.particularOnVoucher.deleteMany({
        where: { voucher: { saleId: saleId } },
      });

      await tx.saleProduct.deleteMany({ where: { saleId } });

      await tx.sale.delete({ where: { id: saleId } });

      // 5️⃣ Delete voucher
      await tx.voucher.delete({ where: { id: voucherId } });

      // 9️⃣ Audit log
      await tx.voucherAudit.create({
        data: {
          voucherId: voucherId,
          branchId: existingSale.branchId,
          userId: req.user?.id || null,
          action: "UPDATE",
          description: `Sale updated for invoice ${existingSale.invoiceNo}`,
          data: { sale: existingSale },
        },
      });

      await tx.salesLog.create({
        data: {
          branchId: existingSale.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          saleId: existingSale.id,
          data: { sale: existingSale, products: existingSale.SaleProduct },
          action: "DELETED",
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Sale Deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const getSalesAll = async (
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

    const whereCondition: Prisma.SaleWhereInput[] = [];
    if (search) {
      whereCondition.push({
        OR: [
          { invoiceNo: { contains: search as string } },
          { customer: { accountType: { contains: search as string } } },
        ],
      });
    }

    const result = await prisma.sale.findMany({
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

    const total = await prisma.sale.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sales retrieved successfully",
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
export const getSalesById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = Number(req.params.id);
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Sales ID is missing in the request parameters",
      });
    }

    const result = await prisma.sale.findFirst({
      where: { id: purchaseId },
      include: {
        SaleProduct: {
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
        message: "Sales not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sales retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
export const getSalesByInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = req.params.id as string;
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Invoice No is missing in the request parameters",
      });
    }

    const result = await prisma.sale.findFirst({
      where: { invoiceNo: purchaseId },
      include: {
        SaleProduct: {
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
        message: "Sales not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sales retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

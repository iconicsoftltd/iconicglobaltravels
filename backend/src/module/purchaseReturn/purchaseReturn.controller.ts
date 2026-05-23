import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createPurchaseReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const {
      purchaseId,
      branchId,
      date,
      challanNo,
      paymentAccountId,
      products,
    } = req.body;
    const purchaseDate = new Date(date);
    const findPurchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!findPurchase) {
      throw new Error("Purchase not found");
    }

    const alreadyReturn = await prisma.purchaseReturn.findFirst({
      where: {
        purchaseId,
      },
    });

    if (alreadyReturn) {
      throw new Error("This purchase has already been returned!");
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
      const [supplier, paymentAccount] = await Promise.all([
        tx.particular.findUnique({ where: { id: findPurchase.supplierId } }),
        tx.particular.findUnique({ where: { id: paymentAccountId } }),
      ]);
      if (!supplier) throw new Error("Supplier not found");
      if (!paymentAccount) throw new Error("Payment account not found");

      // 3️⃣ Create Purchase
      const purchaseRecord = await tx.purchaseReturn.create({
        data: {
          branchId,
          date: purchaseDate,
          challanNo,
          supplierId: findPurchase.supplierId,
          paymentAccountId,
          totalAmount,
          totalPaymentAmount,
          purchaseId,
        },
      });

      // 4️⃣ Insert Purchase Products + update ProductVariation
      const purchaseProductPromises = products.map(async (p: any) => {
        await tx.purchaseReturnProduct.create({
          data: {
            branchId,
            purchaseReturnId: purchaseRecord.id,
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

        const totalStock = (productVar.stockQuantity || 0) - p.quantity;
        const totalDamage =
          (productVar.damageQuantity || 0) - (p.damageQuantity || 0);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: totalStock, damageQuantity: totalDamage },
        });
      });
      await Promise.all(purchaseProductPromises);

      // 5️⃣ Create Voucher
      const lastVoucher = await tx.voucher.findFirst({
        where: { branchId },
        orderBy: { id: "desc" },
      });
      const voucherNo = `VCH-${branchId}-${(lastVoucher?.id || 0) + 1}`;

      const voucher = await tx.voucher.create({
        data: {
          branchId,
          purchaseReturnId: purchaseRecord.id,
          voucherNo,
          type: "PURCHASE_RETURN",
          date: purchaseDate,
          narration: `Purchase Return ${challanNo} from Supplier ID ${findPurchase.supplierId}`,
        },
      });

      // 6️⃣ Accounting Entries

      // a) Inventory Ledger (Debit total purchase)
      const inventoryLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Inventory" },
        include: { particulars: { take: 1 } },
      });

      if (!inventoryLedger || !inventoryLedger.particulars[0])
        throw new Error("Inventory ledger/particular not found");

      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: inventoryLedger.particulars[0].id,
          type: "Credit",
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

      // b) Supplier Ledger (Credit total purchase)
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: supplier.id,
          type: "Debit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: supplier.id },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: supplier.ledgerId },
        data: { balance: { decrement: totalAmount } },
      });

      // c) Payment made immediately
      if (totalPaymentAmount > 0) {
        // Debit Supplier (payment reduces liability)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: supplier.id,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: supplier.id },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: supplier.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });

        // Credit Payment Account (asset decreases)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccount.id,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccount.id },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: paymentAccount.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });
      }

      // 7️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId: req.user?.id || null,
          action: "CREATE",
          description: `Purchase Return voucher created for challan ${challanNo} with ${products.length} products`,
          data: { purchase: purchaseRecord, products },
        },
      });

      await prisma.purchaseReturnLog.create({
        data: {
          branchId: purchaseRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          purchaseReturnId: purchaseRecord.id,
          data: { purchase: purchaseRecord, products },
          action: "CREATED",
        },
      });

      return purchaseRecord;
    });

    return res.status(201).json({
      success: true,
      message: "Purchase Return created successfully",
      data: purchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePurchaseReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const purchaseReturnId = Number(req.params.id);
    const { branchId, date, challanNo, paymentAccountId, products } = req.body;
    const purchaseDate = new Date(date);

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing purchase
      const existingPurchase = await tx.purchaseReturn.findUnique({
        where: { id: purchaseReturnId },
        include: { PurchaseReturnProduct: true },
      });
      if (!existingPurchase) throw new Error("Purchase Return not found");

      // 2️⃣ Revert old ProductVariation stock & purchasePrice
      for (const p of existingPurchase.PurchaseReturnProduct) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        const oldStock = productVar.stockQuantity + p.quantity;
        const oldDamage = productVar.damageQuantity + p.damageQuantity;
        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: oldStock, damageQuantity: oldDamage },
        });
      }

      // 3️⃣ Revert old accounting entries (with ledger nature)
      const oldEntries = await tx.particularOnVoucher.findMany({
        where: { voucher: { purchaseReturnId: purchaseReturnId } },
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
        where: { voucher: { purchaseReturnId: purchaseReturnId } },
      });
      await tx.purchaseReturnProduct.deleteMany({
        where: { purchaseReturnId: purchaseReturnId },
      });

      // 5️⃣ Update Purchase main record
      const productsTotal = products.reduce(
        (sum: any, p: any) => sum + p.quantity * p.unitPrice,
        0,
      );
      const totalAmount = productsTotal;
      const totalPaymentAmount = totalAmount;

      const updatedPurchaseRecord = await tx.purchaseReturn.update({
        where: { id: purchaseReturnId },
        data: {
          branchId,
          date: purchaseDate,
          challanNo,
          supplierId: existingPurchase.supplierId,
          paymentAccountId,
          totalAmount,
          totalPaymentAmount,
        },
      });

      // 6️⃣ Insert new purchase products + update ProductVariation
      const productPromises = products.map(async (p: any) => {
        await tx.purchaseReturnProduct.create({
          data: {
            branchId,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            damageQuantity: p.damageQuantity || 0,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
            purchaseReturnId: purchaseReturnId,
          },
        });

        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar)
          throw new Error(
            `ProductVariation ID ${p.variationProductId} not found`,
          );

        const totalStock = (productVar.stockQuantity || 0) - p.quantity;
        const totalDamage =
          (productVar.damageQuantity || 0) - (p.damageQuantity || 0);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: totalStock, damageQuantity: totalDamage },
        });
      });
      await Promise.all(productPromises);

      const findVoucher = await tx.voucher.findFirst({
        where: { purchaseReturnId: purchaseReturnId },
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
          purchaseReturnId,
          type: "PURCHASE_RETURN",
          date: purchaseDate,
          narration: `Purchase Return ${challanNo} from Supplier ID ${existingPurchase.supplierId}`,
        },
      });

      // Accounting Entries
      const inventoryLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Inventory" },
        include: { particulars: { take: 1 } },
      });

      console.log({ inventoryLedger });

      if (!inventoryLedger || !inventoryLedger.particulars[0])
        throw new Error("Inventory ledger/particular not found");

      // Debit Inventory
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: inventoryLedger.particulars[0].id,
          type: "Credit",
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

      const supplier = await tx.particular.findUnique({
        where: { id: existingPurchase.supplierId },
      });
      if (!supplier) throw new Error("Supplier not found");

      // Credit Supplier
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: supplier.id,
          type: "Debit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: supplier.id },
        data: { balance: { decrement: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: supplier.ledgerId },
        data: { balance: { decrement: totalAmount } },
      });

      const paymentAccount = await tx.particular.findUnique({
        where: { id: paymentAccountId },
      });
      if (!paymentAccount) throw new Error("Payment account not found");
      if (totalPaymentAmount > 0) {
        // Debit Supplier (reduce liability)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: supplier.id,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: supplier.id },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: supplier.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });

        // Credit Payment Account (asset decreases)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccount.id,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccount.id },
          data: { balance: { increment: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: paymentAccount.ledgerId },
          data: { balance: { increment: totalPaymentAmount } },
        });
      }

      // 8️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId: req.user?.id || null,
          action: "UPDATE",
          description: `Purchase Return voucher updated for challan ${challanNo} with ${products.length} products`,
          data: { purchaseReturn: updatedPurchaseRecord, products },
        },
      });

      await prisma.purchaseReturnLog.create({
        data: {
          branchId: updatedPurchaseRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          purchaseReturnId: updatedPurchaseRecord.id,
          data: { purchase: updatedPurchaseRecord, products },
          action: "UPDATED",
        },
      });

      return updatedPurchaseRecord;
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Return updated successfully",
      data: updatedPurchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePurchaseReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const purchaseReturnId = req.params.id;

    const deletedPurchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch purchase with products and voucher
      const purchase = await tx.purchaseReturn.findUnique({
        where: { id: Number(purchaseReturnId) },
        include: {
          PurchaseReturnProduct: true,
        },
      });
      if (!purchase) throw new Error("Purchase Return not found");

      // 2️⃣ Revert ProductVariation stock & purchasePrice
      for (const p of purchase.PurchaseReturnProduct) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        const oldStock = productVar.stockQuantity + p.quantity;
        const oldDamage = productVar.damageQuantity + (p.damageQuantity || 0);

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: { stockQuantity: oldStock, damageQuantity: oldDamage },
        });
      }
      const findVoucher = await tx.voucher.findFirst({
        where: {
          purchaseReturnId: Number(purchaseReturnId),
        },
      });
      // 3️⃣ Revert accounting entries
      if (findVoucher) {
        const oldEntries = await tx.particularOnVoucher.findMany({
          where: { voucher: { purchaseReturnId: Number(purchaseReturnId) } },
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
              purchaseReturnId: Number(purchaseReturnId),
            },
          },
        });
        await tx.voucher.deleteMany({
          where: { purchaseReturnId: Number(purchaseReturnId) },
        });
      }

      // 5️⃣ Delete purchase products
      await tx.purchaseReturnProduct.deleteMany({
        where: { purchaseReturnId: purchase.id },
      });

      // 6️⃣ Delete main purchase record
      await tx.purchaseReturn.delete({ where: { id: purchase.id } });

      // 7️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: findVoucher?.id || 0,
          branchId: purchase.branchId,
          userId: req.user?.id || null,
          action: "DELETE",
          description: `Purchase Return deleted for challan ${purchase.challanNo} with ${purchase.PurchaseReturnProduct.length} products`,
          data: { purchase, product: purchase.PurchaseReturnProduct },
        },
      });

      await prisma.purchaseReturnLog.create({
        data: {
          branchId: purchase.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          purchaseReturnId: purchase.id,
          data: {
            purchase: purchase,
            products: purchase.PurchaseReturnProduct,
          },
          action: "DELETED",
        },
      });

      return purchase;
    });

    return res.status(200).json({
      success: true,
      message: "Purchase Return deleted successfully",
      data: deletedPurchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getPurchaseReturnAll = async (
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

    const whereCondition: Prisma.PurchaseReturnWhereInput[] = [];
    if (search) {
      whereCondition.push({
        OR: [
          { challanNo: { contains: search as string } },
          { supplier: { accountType: { contains: search as string } } },
        ],
      });
    }

    const result = await prisma.purchaseReturn.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      include: {
        supplier: {
          select: {
            accountType: true,
          },
        },
      },
      skip: skip * take,
      take,
      orderBy: { date: order },
    });

    const total = await prisma.purchaseReturn.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Purchases Return retrieved successfully",
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
export const getPurchaseReturnById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = Number(req.params.id);
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Purchase Return ID is missing in the request parameters",
      });
    }

    const result = await prisma.purchaseReturn.findFirst({
      where: { id: purchaseId },
      include: {
        PurchaseReturnProduct: {
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
        supplier: true,
        account: true,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Purchase Return not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Purchase Return retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

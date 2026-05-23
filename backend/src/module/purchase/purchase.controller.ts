import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const {
      branchId,
      date,
      challanNo,
      supplierId,
      paymentAccountId,
      vat = 0,
      tc = 0,
      totalPaymentAmount = 0,
      products,
    } = req.body;
    const purchaseDate = new Date(date);

    const purchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Total amount & due
      const productsTotal = products.reduce(
        (sum: any, p: any) => sum + p.quantity * p.unitPrice,
        0,
      );
      const totalAmount = productsTotal + vat + tc;
      if (totalPaymentAmount > totalAmount)
        throw new Error("Total payment cannot exceed total amount");
      const dueAmount = totalAmount - totalPaymentAmount;

      // 2️⃣ Fetch supplier & payment account
      const [supplier, paymentAccount] = await Promise.all([
        tx.particular.findUnique({
          where: { id: supplierId },
          select: {
            id: true,
            accountType: true,
            ledgerId: true,
            balance: true,
            ledger: {
              select: {
                group: {
                  select: { account: true },
                },
              },
            },
          },
        }),
        tx.particular.findUnique({
          where: { id: paymentAccountId },
          select: {
            id: true,
            accountType: true,
            ledgerId: true,
            ledger: {
              select: {
                group: {
                  select: { account: true },
                },
              },
            },
          },
        }),
      ]);

      const supplierAccountType = supplier?.ledger?.group?.account; // party name
      const paymentAccountType = paymentAccount?.ledger?.group?.account; // payment method

      if (!supplierAccountType) {
        throw new Error("Supplier ledger configuration invalid");
      }

      if (!paymentAccountType) {
        throw new Error("Payment account ledger configuration invalid");
      }

      if (supplierAccountType !== "Liability") {
        throw new Error("Supplier ledger must be Liability");
      }

      if (paymentAccountType !== "Assets") {
        throw new Error("Payment account ledger must be Asset");
      }
      // 3️⃣ Create Purchase
      const purchaseRecord = await tx.purchase.create({
        data: {
          branchId,
          date: purchaseDate,
          challanNo,
          supplierId,
          paymentAccountId,
          totalAmount,
          totalPaymentAmount,
          dueAmount,
          previousDue: supplier.balance,
          vat,
          tc,
        },
      });

      // 4️⃣ Insert Purchase Products + update ProductVariation

      for (const p of products) {
        await tx.purchaseProduct.create({
          data: {
            branchId,
            purchaseId: purchaseRecord.id,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            damageQuantity: p.damageQuantity || 0,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
          },
        });

        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
          select: {
            stockQuantity: true,
            damageQuantity: true,
            purchasePrice: true,
          },
        });

        if (!productVar) {
          throw new Error(
            `ProductVariation ID ${p.variationProductId} not found`,
          );
        }

        const prevStock = productVar.stockQuantity ?? 0;
        const prevDamage = productVar.damageQuantity ?? 0;
        const prevPurchasePrice = productVar.purchasePrice ?? 0;

        const incomingQty = p.quantity ?? 0;
        const incomingDamage = p.damageQuantity ?? 0;
        const incomingUnitPrice = p.unitPrice ?? 0;

        const totalStock = prevStock + incomingQty;
        const totalDamage = prevDamage + incomingDamage;

        // Avoid division by zero
        const newPurchasePrice =
          totalStock > 0
            ? (prevPurchasePrice * prevStock +
                incomingUnitPrice * incomingQty) /
              totalStock
            : 0;

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: {
            stockQuantity: totalStock,
            damageQuantity: totalDamage,
            purchasePrice: newPurchasePrice,
          },
        });
      }

      // 5️⃣ Create Voucher
      const lastVoucher = await tx.voucher.findFirst({
        where: { branchId },
        orderBy: { id: "desc" },
      });
      const voucherNo = `VCH-${branchId}-${(lastVoucher?.id || 0) + 1}`;

      const voucher = await tx.voucher.create({
        data: {
          branchId,
          purchaseId: purchaseRecord.id,
          voucherNo,
          type: "PURCHASE",
          date: purchaseDate,
          narration: `Purchase ${challanNo} from Supplier: ${supplier.accountType}`,
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
          particularId: paymentAccountId,
          type: "Debit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: inventoryLedger.particulars[0].id },
        data: { balance: { increment: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: inventoryLedger.id },
        data: { balance: { increment: totalAmount } },
      });

      // b) Supplier Ledger (Credit total purchase)
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: supplier.id,
          type: "Credit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: supplier.id },
        data: { balance: { increment: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: supplier.ledgerId },
        data: { balance: { increment: totalAmount } },
      });

      // c) Payment made immediately
      if (totalPaymentAmount > 0) {
        // Debit Supplier (payment reduces liability)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: supplier.id,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: supplier.id },
          data: { balance: { decrement: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: supplier.ledgerId },
          data: { balance: { decrement: totalPaymentAmount } },
        });

        // Credit Payment Account (asset decreases)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccountId,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccountId },
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
          description: `Purchase voucher created for challan ${challanNo} with ${products.length} products`,
          data: { purchase: purchaseRecord, products },
        },
      });

      await tx.purchaseLog.create({
        data: {
          branchId: purchaseRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          purchaseId: purchaseRecord.id,
          data: { purchase: purchaseRecord, products },
          action: "CREATED",
        },
      });

      return purchaseRecord;
    });

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePurchase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const purchaseId = Number(req.params.id);
    const {
      branchId,
      date,
      challanNo,
      supplierId,
      paymentAccountId,
      vat = 0,
      tc = 0,
      totalPaymentAmount = 0,
      products,
    } = req.body;
    const purchaseDate = new Date(date);

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing purchase
      const existingPurchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { PurchaseProduct: true },
      });
      if (!existingPurchase) throw new Error("Purchase not found");

      // 2️⃣ Revert old ProductVariation stock & purchasePrice
      for (const p of existingPurchase.PurchaseProduct) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        const oldTotalValue =
          productVar.purchasePrice * productVar.stockQuantity -
          p.unitPrice * p.quantity;
        const oldStock = productVar.stockQuantity - p.quantity;
        const oldDamage = productVar.damageQuantity - p.damageQuantity;
        const oldPurchasePrice = oldStock > 0 ? oldTotalValue / oldStock : 0;
        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: {
            stockQuantity: oldStock,
            damageQuantity: oldDamage,
            purchasePrice: oldPurchasePrice,
          },
        });
      }

      // 3️⃣ Revert old accounting entries (with ledger nature)
      const oldEntries = await tx.particularOnVoucher.findMany({
        where: { voucher: { purchaseId: purchaseId } },
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
        where: { voucher: { purchaseId: purchaseId } },
      });
      await tx.purchaseProduct.deleteMany({
        where: { purchaseId: purchaseId },
      });

      // 5️⃣ Update Purchase main record
      const productsTotal = products.reduce(
        (sum: any, p: any) => sum + p.quantity * p.unitPrice,
        0,
      );
      const totalAmount = productsTotal + vat + tc;
      const dueAmount = totalAmount - totalPaymentAmount;

      const updatedPurchaseRecord = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          branchId,
          date: purchaseDate,
          challanNo,
          supplierId,
          paymentAccountId,
          totalAmount,
          totalPaymentAmount,
          dueAmount,
          vat,
          tc,
        },
      });

      // 6️⃣ Insert new purchase products + update ProductVariation
      const productPromises = products.map(async (p: any) => {
        await tx.purchaseProduct.create({
          data: {
            branchId,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            damageQuantity: p.damageQuantity || 0,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
            purchaseId: purchaseId,
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
        const newPurchasePrice =
          (productVar.purchasePrice * (productVar.stockQuantity || 0) +
            p.unitPrice * p.quantity) /
          totalStock;

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: {
            stockQuantity: totalStock,
            damageQuantity: totalDamage,
            purchasePrice: newPurchasePrice,
          },
        });
      });
      await Promise.all(productPromises);

      const findVoucher = await tx.voucher.findFirst({
        where: { purchaseId: purchaseId },
      });
      if (!findVoucher) {
        throw new Error(`Previous voucher not found`);
      }

      const [supplier, paymentAccount] = await Promise.all([
        tx.particular.findUnique({
          where: { id: supplierId },
          select: {
            id: true,
            accountType: true,
            ledgerId: true,
            ledger: { include: { group: true } },
          },
        }),
        tx.particular.findUnique({
          where: { id: paymentAccountId },
          include: { ledger: { include: { group: true } } },
        }),
      ]);
      if (!supplier) throw new Error("Supplier not found");
      if (!paymentAccount) throw new Error("Payment account not found");
      if (supplier.ledger.group.account !== "Liability") {
        throw new Error("Supplier ledger must be Liability");
      }
      if (paymentAccount.ledger.group.account !== "Assets") {
        throw new Error("Payment account ledger must be Asset");
      }

      const voucher = await tx.voucher.update({
        where: {
          id: findVoucher.id,
        },
        data: {
          branchId,
          purchaseId,
          type: "PURCHASE",
          date: purchaseDate,
          narration: `Purchase ${challanNo} from Supplier: ${supplier?.accountType}`,
        },
      });

      // Accounting Entries
      const inventoryLedger = await tx.ledger.findFirst({
        where: { branchId, ledgerType: "Purchase" },
        include: { particulars: { take: 1 } },
      });
      if (!inventoryLedger || !inventoryLedger.particulars[0])
        throw new Error("Inventory ledger/particular not found");

      // Debit Inventory
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: paymentAccountId,
          type: "Debit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: inventoryLedger.particulars[0].id },
        data: { balance: { increment: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: inventoryLedger.id },
        data: { balance: { increment: totalAmount } },
      });

      // Credit Supplier
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: supplier.id,
          type: "Credit",
          amount: totalAmount,
        },
      });
      await tx.particular.update({
        where: { id: supplier.id },
        data: { balance: { increment: totalAmount } },
      });
      await tx.ledger.update({
        where: { id: supplier.ledgerId },
        data: { balance: { increment: totalAmount } },
      });

      if (totalPaymentAmount > 0) {
        // Debit Supplier (reduce liability)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: supplier.id,
            type: "Debit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: supplier.id },
          data: { balance: { decrement: totalPaymentAmount } },
        });
        await tx.ledger.update({
          where: { id: supplier.ledgerId },
          data: { balance: { decrement: totalPaymentAmount } },
        });

        // Credit Payment Account (asset decreases)
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: paymentAccountId,
            type: "Credit",
            amount: totalPaymentAmount,
          },
        });
        await tx.particular.update({
          where: { id: paymentAccountId },
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
          description: `Purchase voucher updated for challan ${challanNo} with ${products.length} products`,
          data: { purchase: updatedPurchaseRecord, products },
        },
      });

      await tx.purchaseLog.create({
        data: {
          branchId: updatedPurchaseRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          purchaseId: updatedPurchaseRecord.id,
          data: { purchase: updatedPurchaseRecord, products },
          action: "UPDATED",
        },
      });

      return updatedPurchaseRecord;
    });

    return res.status(200).json({
      success: true,
      message: "Purchase updated successfully",
      data: updatedPurchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePurchase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const purchaseId = Number(req.params.id);

    const deletedPurchase = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch purchase with products and voucher
      const purchase = await tx.purchase.findUnique({
        where: { id: Number(purchaseId) },
        include: {
          PurchaseProduct: true,
        },
      });
      if (!purchase) throw new Error("Purchase not found");

      // 2️⃣ Revert ProductVariation stock & purchasePrice
      for (const p of purchase.PurchaseProduct) {
        const productVar = await tx.productVariation.findUnique({
          where: { id: p.variationProductId },
        });
        if (!productVar) continue;

        const oldTotalValue =
          productVar.purchasePrice * productVar.stockQuantity -
          p.unitPrice * p.quantity;
        const oldStock = productVar.stockQuantity - p.quantity;
        const oldDamage = productVar.damageQuantity - (p.damageQuantity || 0);
        const oldPurchasePrice = oldStock > 0 ? oldTotalValue / oldStock : 0;

        await tx.productVariation.update({
          where: { id: p.variationProductId },
          data: {
            stockQuantity: oldStock,
            damageQuantity: oldDamage,
            purchasePrice: oldPurchasePrice,
          },
        });
      }
      const findVoucher = await tx.voucher.findFirst({
        where: {
          purchaseId: Number(purchaseId),
        },
      });
      // 3️⃣ Revert accounting entries
      if (findVoucher) {
        const oldEntries = await tx.particularOnVoucher.findMany({
          where: { voucher: { purchaseId: Number(purchaseId) } },
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
              purchaseId: Number(purchaseId),
            },
          },
        });
        await tx.voucher.deleteMany({
          where: { purchaseId: Number(purchaseId) },
        });
      }

      // 5️⃣ Delete purchase products
      await tx.purchaseProduct.deleteMany({
        where: { purchaseId: purchase.id },
      });

      // 6️⃣ Delete main purchase record
      await tx.purchase.delete({ where: { id: purchase.id } });

      // 7️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: findVoucher?.id || 0,
          branchId: purchase.branchId,
          userId: req.user?.id || null,
          action: "DELETE",
          description: `Purchase deleted for challan ${purchase.challanNo} with ${purchase.PurchaseProduct.length} products`,
          data: { purchase, products: purchase.PurchaseProduct },
        },
      });
      await tx.purchaseLog.create({
        data: {
          branchId: purchase.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          purchaseId: purchase.id,
          data: { purchase: purchase, products: purchase.PurchaseProduct },
          action: "DELETED",
        },
      });

      return purchase;
    });

    return res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
      data: deletedPurchase,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getPurchaseAll = async (
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

    const whereCondition: Prisma.PurchaseWhereInput[] = [];
    if (search) {
      whereCondition.push({
        OR: [
          { challanNo: { contains: search as string } },
          { supplier: { accountType: { contains: search as string } } },
        ],
      });
    }

    const result = await prisma.purchase.findMany({
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

    const total = await prisma.purchase.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Purchases retrieved successfully",
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
export const getPurchaseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = Number(req.params.id);
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Purchase ID is missing in the request parameters",
      });
    }

    const result = await prisma.purchase.findFirst({
      where: { id: purchaseId },
      include: {
        PurchaseProduct: {
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
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Purchase retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
export const getPurchaseByInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = req.params.id as string;
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Invoice no is missing in the request parameters",
      });
    }

    const result = await prisma.purchase.findFirst({
      where: { challanNo: purchaseId },
      include: {
        PurchaseProduct: {
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
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Purchase retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

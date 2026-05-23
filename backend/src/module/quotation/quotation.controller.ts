import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    branchId,
    date,
    invoiceNo,
    customerId,
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

      const finalTotalAmount = totalAmount + tc + vat - discount;
      const sale = await tx.quotation.create({
        data: {
          branchId,
          date: saleDate,
          invoiceNo,
          customerId,
          totalAmount: finalTotalAmount,
          vat,
          tc,
          discount,
        },
      });
      for (const p of products) {
        await tx.quotationProduct.create({
          data: {
            quotationId: sale.id,
            branchId,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subTotal: p.unitPrice * p.quantity,
          },
        });
      }

      await prisma.quotationLog.create({
        data: {
          branchId: sale.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          quotationId: sale.id,
          data: { quotation: sale, quotationProducts: products },
          action: "CREATED",
        },
      });

      return sale;
    });

    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const saleId = Number(req.params.id);
    const {
      branchId,
      date,
      invoiceNo,
      customerId,
      vat = 0,
      discount = 0,
      tc = 0,
      products,
    } = req.body;

    const saleDate = new Date(date);

    const updatedSale = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing sale
      const existingSale = await tx.quotation.findUnique({
        where: { id: saleId },
      });
      if (!existingSale) throw new Error("Quotation not found");

      await tx.quotationProduct.deleteMany({ where: { quotationId: saleId } });

      // 5️⃣ Update sale main record
      const totalAmountCalc = products.reduce(
        (sum: any, p: any) => sum + p.unitPrice * p.quantity,
        0,
      );
      const finalTotalAmount = totalAmountCalc + vat + tc - discount;

      const updatedSaleRecord = await tx.quotation.update({
        where: { id: saleId },
        data: {
          branchId,
          date: saleDate,
          invoiceNo,
          customerId,
          totalAmount: finalTotalAmount,
          vat,
          tc,
          discount,
        },
      });

      for (const p of products) {
        await tx.quotationProduct.create({
          data: {
            quotationId: updatedSaleRecord.id,
            branchId,
            variationProductId: p.variationProductId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subTotal: p.quantity * p.unitPrice,
          },
        });
      }

      await prisma.quotationLog.create({
        data: {
          branchId: updatedSaleRecord.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          quotationId: updatedSaleRecord.id,
          data: { quotation: updatedSaleRecord, quotationProducts: products },
          action: "UPDATED",
        },
      });
      return updatedSaleRecord;
    });

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: updatedSale,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteQuotation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const saleId = Number(req.params.id);
    const deleteSale = await prisma.$transaction(async (tx) => {
      const existingSale = await tx.quotation.findUnique({
        where: { id: saleId },
        include: {
          quotationProducts: true,
        },
      });
      if (!existingSale) throw new Error("Quotation not found");

      await tx.quotationProduct.deleteMany({ where: { quotationId: saleId } });
      await tx.quotation.delete({ where: { id: saleId } });
      await prisma.quotationLog.create({
        data: {
          branchId: existingSale.branchId,
          ip: req.ip || "0.0.0.0",
          updatedById: id,
          quotationId: existingSale.id,
          data: {
            quotation: existingSale,
            quotationProducts: existingSale.quotationProducts,
          },
          action: "DELETED",
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Quotation Deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const getQuotationAll = async (
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

    const whereCondition: Prisma.QuotationWhereInput[] = [];
    if (search) {
      whereCondition.push({
        OR: [
          { invoiceNo: { contains: search as string } },
          { customer: { accountType: { contains: search as string } } },
        ],
      });
    }

    const result = await prisma.quotation.findMany({
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

    const total = await prisma.quotation.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Quotation retrieved successfully",
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
export const getQuotationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const purchaseId = Number(req.params.id);
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        message: "Quotation ID is missing in the request parameters",
      });
    }

    const result = await prisma.quotation.findFirst({
      where: { id: purchaseId },
      include: {
        quotationProducts: {
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
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quotation retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

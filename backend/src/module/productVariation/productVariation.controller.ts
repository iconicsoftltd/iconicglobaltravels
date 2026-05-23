import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// Create ProductVariation
export const createProductVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findVariation = await prisma.productVariation.findFirst({
      where: {
        productId: req.body.productId,
        sizeId: req.body.sizeId,
        colorId: req.body.colorId,
        branchId: req.body.branchId,
      },
    });

    if (findVariation) {
      return res.status(400).json({ success: false, message: "Product Variation Already Exists" });
    }

    const result = await prisma.productVariation.create({ data: req.body });

    await prisma.productVariationLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        variationId: result.id,
        data: result,
        action: "CREATED"
      }
    })


    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product Variation Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Get All ProductVariations
export const getProductVariationAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.ProductVariationWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [
          { product: { name: { contains: search as string } } },
          { product: { productCode: { contains: search as string } } },
        ],
      });
    }

    const result = await prisma.productVariation.findMany({
      where: { branchId: Number(branchId), AND: whereCondition },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
      include: { product: { include: { category: true, unit: true, subCategory: true, brand: true } }, size: true, color: true, branch: true },
    });

    const total = await prisma.productVariation.count({
      where: { branchId: Number(branchId), AND: whereCondition },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product Variations retrieved successfully",
      meta: { page, size: take, total, totalPage: Math.ceil(total / take) },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get ProductVariation by ID
export const getProductVariationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variationId = Number(req.params.id);
    if (!variationId) return res.status(400).json({ success: false, message: "Product Variation ID is missing" });

    const result = await prisma.productVariation.findFirst({
      where: { id: variationId },
      include: { product: true, size: true, color: true, branch: true },
    });

    if (!result) return res.status(404).json({ success: false, message: "Product Variation not found" });

    res.status(200).json({ success: true, message: "Product Variation retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
};

// Update ProductVariation
export const updateProductVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const variationId = Number(req.params.id);
    const data = req.body;

    if (!variationId) return res.status(400).json({ success: false, message: "Product Variation ID is missing" });

    const existingVariation = await prisma.productVariation.findUnique({ where: { id: variationId } });
    if (!existingVariation) return res.status(404).json({ success: false, message: "Product Variation not found" });

    const result = await prisma.productVariation.update({ where: { id: variationId }, data });


    await prisma.productVariationLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        variationId: result.id,
        data: result,
        action: "UPDATED",
      }
    })


    res.status(200).json({ success: true, message: "Product Variation updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

// Delete ProductVariation
export const deleteProductVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { id } = req.user;
    const variationId = Number(req.params.id);
    if (!variationId) return res.status(400).json({ success: false, message: "Product Variation ID is missing" });

    const result = await prisma.productVariation.delete({ where: { id: variationId } });


    await prisma.productVariationLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        variationId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({ success: true, message: "Product Variation deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
};

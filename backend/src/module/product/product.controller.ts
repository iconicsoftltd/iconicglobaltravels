import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// Create Product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findProduct = await prisma.product.findFirst({
      where: {
        name: req.body.name,
        branchId: req.body.branchId,
      },
    });

    if (findProduct) {
      return res.status(400).json({ success: false, message: "Product Already Exists" });
    }

    const result = await prisma.product.create({ data: req.body });

    await prisma.productLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        productId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Products
export const getProductAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.ProductWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [
          { name: { contains: search as string } },
          { productCode: { contains: search as string } },
        ],
      });
    }

    const result = await prisma.product.findMany({
      where: { branchId: Number(branchId), AND: whereCondition },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
      include: {
        category: true,
        subCategory: true,
        unit: true,
        brand: true,
        branch: true,
      },
    });

    const total = await prisma.product.count({
      where: { branchId: Number(branchId), AND: whereCondition },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Products retrieved successfully",
      meta: { page, size: take, total, totalPage: Math.ceil(total / take) },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get Product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.params.id);
    if (!productId) return res.status(400).json({ success: false, message: "Product ID is missing" });

    const result = await prisma.product.findFirst({
      where: { id: productId },
      include: { category: true, subCategory: true, unit: true, brand: true, branch: true },
    });

    if (!result) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const productId = Number(req.params.id);
    const data = req.body;

    if (!productId) return res.status(400).json({ success: false, message: "Product ID is missing" });

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found" });

    const result = await prisma.product.update({ where: { id: productId }, data });

    await prisma.productLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        productId: result.id,
        data: result,
        action: "UPDATED",
      }
    })


    res.status(200).json({ success: true, message: "Product updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const productId = Number(req.params.id);
    if (!productId) return res.status(400).json({ success: false, message: "Product ID is missing" });

    const result = await prisma.product.delete({ where: { id: productId } });


    await prisma.productLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        productId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({ success: true, message: "Product deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
};

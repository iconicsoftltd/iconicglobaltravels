import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create Category
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findCategory = await prisma.category.findFirst({
      where: req.body,
    });

    if (findCategory) {
      return res.status(400).send({
        success: false,
        message: "Category Already Exists",
      });
    }

    const result = await prisma.category.create({
      data: req.body,
    });

    await prisma.productCategoryLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        categoryId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Category Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get All Categories (with pagination, search, filter)
export const getCategoryAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.CategoryWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.category.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.category.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category retrieved successfully",
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

// ✅ Get Category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = Number(req.params.id);

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is missing in the request parameters",
      });
    }

    const result = await prisma.category.findFirst({
      where: { id: categoryId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const categoryId = Number(req.params.id);
    const { ...data } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is missing in the request parameters",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const result = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    await prisma.productCategoryLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        categoryId: result.id,
        data: result,
        action: "UPDATED",
      }
    })
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Category
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const categoryId = Number(req.params.id);

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is missing in the request parameters",
      });
    }

    const result = await prisma.category.delete({
      where: { id: categoryId },
    });

    await prisma.productCategoryLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        categoryId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

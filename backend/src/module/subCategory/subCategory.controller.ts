import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create SubCategory
export const createSubCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findSubCategory = await prisma.subCategory.findFirst({
      where: req.body,
    });

    if (findSubCategory) {
      return res.status(400).send({
        success: false,
        message: "SubCategory Already Exists",
      });
    }

    const result = await prisma.subCategory.create({
      data: req.body,
    });

    await prisma.productSubCategoryLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        subCategoryId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "SubCategory Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get All SubCategories (with pagination, search, filter)
export const getSubCategoryAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId, categoryId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.SubCategoryWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    if (categoryId) {
      whereCondition.push({
        categoryId: Number(categoryId),
      });
    }

    const result = await prisma.subCategory.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
      include: {
        category: true,
      },
    });

    const total = await prisma.subCategory.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "SubCategory retrieved successfully",
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

// ✅ Get SubCategory by ID
export const getSubCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subCategoryId = Number(req.params.id);

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "SubCategory ID is missing in the request parameters",
      });
    }

    const result = await prisma.subCategory.findFirst({
      where: { id: subCategoryId },
      include: { category: true },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SubCategory retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update SubCategory
export const updateSubCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const subCategoryId = Number(req.params.id);
    const { ...data } = req.body;

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "SubCategory ID is missing in the request parameters",
      });
    }

    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (!existingSubCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    const result = await prisma.subCategory.update({
      where: { id: subCategoryId },
      data,
    });

    await prisma.productSubCategoryLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        subCategoryId: result.id,
        data: result,
        action: "UPDATED",
      }
    })

    res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete SubCategory
export const deleteSubCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const subCategoryId = Number(req.params.id);

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "SubCategory ID is missing in the request parameters",
      });
    }

    const result = await prisma.subCategory.delete({
      where: { id: subCategoryId },
    });

    await prisma.productSubCategoryLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        subCategoryId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

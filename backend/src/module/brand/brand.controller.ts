import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create Brand
export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findBrand = await prisma.brand.findFirst({
      where: req.body,
    });

    if (findBrand) {
      return res.status(400).send({
        success: false,
        message: "Brand Already Exists",
      });
    }

    const result = await prisma.brand.create({
      data: req.body,
    });

    await prisma.brandLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        brandId: result.id,
        data: result,
        action: "CREATED"
      }
    })
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Brand Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get All Brands (pagination, search, filter)
export const getBrandAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.BrandWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.brand.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.brand.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Brand retrieved successfully",
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

// ✅ Get Brand by ID
export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brandId = Number(req.params.id);

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is missing in the request parameters",
      });
    }

    const result = await prisma.brand.findFirst({
      where: { id: brandId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brand retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Brand
export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const brandId = Number(req.params.id);
    const { ...data } = req.body;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is missing in the request parameters",
      });
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const result = await prisma.brand.update({
      where: { id: brandId },
      data,
    });

    await prisma.brandLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        brandId: result.id,
        data: result,
        action: "UPDATED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Brand
export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const brandId = Number(req.params.id);

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is missing in the request parameters",
      });
    }

    const result = await prisma.brand.delete({
      where: { id: brandId },
    });

    await prisma.brandLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        brandId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

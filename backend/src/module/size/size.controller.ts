import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create Size
export const createSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findSize = await prisma.size.findFirst({
      where: req.body,
    });

    if (findSize) {
      return res.status(400).json({
        success: false,
        message: "Size Already Exists",
      });
    }

    const result = await prisma.size.create({
      data: req.body,
    });

    await prisma.sizeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        sizeId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Size Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get All Sizes (with pagination, search)
export const getSizeAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.SizeWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.size.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.size.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sizes retrieved successfully",
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

// ✅ Get Size by ID
export const getSizeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sizeId = Number(req.params.id);

    if (!sizeId) {
      return res.status(400).json({
        success: false,
        message: "Size ID is missing in the request parameters",
      });
    }

    const result = await prisma.size.findFirst({
      where: { id: sizeId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Size retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Size
export const updateSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const sizeId = Number(req.params.id);
    const { ...data } = req.body;

    if (!sizeId) {
      return res.status(400).json({
        success: false,
        message: "Size ID is missing in the request parameters",
      });
    }

    const existingSize = await prisma.size.findUnique({
      where: { id: sizeId },
    });

    if (!existingSize) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    const result = await prisma.size.update({
      where: { id: sizeId },
      data,
    });

    await prisma.sizeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        sizeId: result.id,
        data: result,
        action: "UPDATED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Size updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Size
export const deleteSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const sizeId = Number(req.params.id);

    if (!sizeId) {
      return res.status(400).json({
        success: false,
        message: "Size ID is missing in the request parameters",
      });
    }

    const result = await prisma.size.delete({
      where: { id: sizeId },
    });

    await prisma.sizeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        sizeId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Size deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

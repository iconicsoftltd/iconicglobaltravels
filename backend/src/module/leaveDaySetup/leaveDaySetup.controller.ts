import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

// ✅ Create Leave Day Setup
export const createLeaveDaySetup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const { name, branchId } = req.body;

    // Check duplicate leave name for same branch
    const existing = await prisma.leaveDaySetup.findFirst({
      where: { name, branchId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Leave day setup already exists",
      });
    }

    const result = await prisma.leaveDaySetup.create({
      data: req.body,
    });

    await prisma.leaveDaySetupLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        leaveDaySetupId: result.id,
        data: result,
        action: "CREATED",
      },
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Leave day setup created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Leave Day Setups (with pagination + search)
export const getLeaveDaySetupAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const whereCondition: Prisma.LeaveDaySetupWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.leaveDaySetup.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.leaveDaySetup.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Leave day setups retrieved successfully",
      meta: {
        page: Number(page) || 1,
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

// ✅ Get Leave Day Setup by ID
export const getLeaveDaySetupById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leaveId = Number(req.params.id);

    if (!leaveId) {
      return res.status(400).json({
        success: false,
        message: "Leave day setup ID is missing in the request parameters",
      });
    }

    const result = await prisma.leaveDaySetup.findFirst({
      where: { id: leaveId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Leave day setup not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave day setup retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Leave Day Setup
export const updateLeaveDaySetup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const leaveId = Number(req.params.id);
    const { ...data } = req.body;

    if (!leaveId) {
      return res.status(400).json({
        success: false,
        message: "Leave day setup ID is missing in the request parameters",
      });
    }

    const existing = await prisma.leaveDaySetup.findUnique({
      where: { id: leaveId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Leave day setup not found",
      });
    }

    const result = await prisma.leaveDaySetup.update({
      where: { id: leaveId },
      data,
    });

    await prisma.leaveDaySetupLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        leaveDaySetupId: result.id,
        data: result,
        action: "UPDATED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Leave day setup updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Leave Day Setup
export const deleteLeaveDaySetup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const leaveId = Number(req.params.id);

    if (!leaveId) {
      return res.status(400).json({
        success: false,
        message: "Leave day setup ID is missing in the request parameters",
      });
    }

    const result = await prisma.leaveDaySetup.delete({
      where: { id: leaveId },
    });

    await prisma.leaveDaySetupLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        leaveDaySetupId: result.id,
        data: result,
        action: "DELETED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Leave day setup deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

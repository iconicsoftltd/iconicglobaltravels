import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create Bank
export const createBank = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findBank = await prisma.bank.findFirst({
      where: req.body,
    });

    if (findBank) {
      return res.status(400).json({
        success: false,
        message: "Bank already exists",
      });
    }

    const result = await prisma.bank.create({
      data: req.body,
    });

    await prisma.bankLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        bankId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Bank created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get All Banks (with pagination, search)
export const getBankAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const whereCondition: Prisma.BankWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.bank.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.bank.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Banks retrieved successfully",
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

// ✅ Get Bank by ID
export const getBankById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bankId = Number(req.params.id);

    if (!bankId) {
      return res.status(400).json({
        success: false,
        message: "Bank ID is missing in the request parameters",
      });
    }

    const result = await prisma.bank.findFirst({
      where: { id: bankId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bank retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Bank
export const updateBank = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { id } = req.user;
    const bankId = Number(req.params.id);
    const { ...data } = req.body;

    if (!bankId) {
      return res.status(400).json({
        success: false,
        message: "Bank ID is missing in the request parameters",
      });
    }

    const existingBank = await prisma.bank.findUnique({
      where: { id: bankId },
    });

    if (!existingBank) {
      return res.status(404).json({
        success: false,
        message: "Bank not found",
      });
    }

    const result = await prisma.bank.update({
      where: { id: bankId },
      data,
    });

    await prisma.bankLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        bankId: result.id,
        data: result,
        action: "UPDATED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Bank updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Bank
export const deleteBank = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const bankId = Number(req.params.id);

    if (!bankId) {
      return res.status(400).json({
        success: false,
        message: "Bank ID is missing in the request parameters",
      });
    }

    const result = await prisma.bank.delete({
      where: { id: bankId },
    });

    await prisma.bankLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        bankId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Bank deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

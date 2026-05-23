
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// 🟢 Create Ledger
export const createLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user;
    const { code, branchId, groupAccountId } = req.body;

    // Check duplicate ledger code within same branch/group
    const existing = await prisma.ledger.findFirst({
      where: {
        code,
        branchId: Number(branchId),
        groupAccountId: Number(groupAccountId),
        ledgerType: req.body.ledgerType
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Ledger already exists for this branch and group",
      });
    }

    const result = await prisma.ledger.create({
      data: {
        branchId: Number(branchId),
        groupAccountId: Number(groupAccountId),
        ledgerType: req.body.ledgerType,
        code: req.body.code,
        balance: 0,

      },
    });

    await prisma.ledgerLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        ledgerId: result.id,
        data: result,
        action: "CREATED"
      }
    })




    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Ledger created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🟡 Get All Ledgers (with pagination + search)
export const getLedgerAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, size, search, branchId, groupAccountId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.LedgerWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { ledgerType: { contains: search as string } },
          { code: { contains: search as string } },
        ],
      });
    }

    if (groupAccountId) {
      whereCondition.push({
        groupAccountId: Number(groupAccountId),
      });
    }

    const result = await prisma.ledger.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      include: {
        group: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.ledger.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
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

// 🟣 Get Ledger by ID
export const getLedgerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ledgerId = Number(req.params.id);

    if (!ledgerId) {
      return res.status(400).json({
        success: false,
        message: "Ledger ID is required",
      });
    }

    const result = await prisma.ledger.findUnique({
      where: { id: ledgerId },
      include: { group: true },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ledger retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🟠 Update Ledger
export const updateLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = req.user;
    const ledgerId = Number(req.params.id);
    const { ...data } = req.body;

    const existing = await prisma.ledger.findUnique({
      where: { id: ledgerId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    const result = await prisma.ledger.update({
      where: { id: ledgerId },
      data: {
        ...data,
      },
    });

    await prisma.ledgerLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        ledgerId: result.id,
        data: result,
        action: "UPDATED",
      }
    })



    res.status(200).json({
      success: true,
      message: "Ledger updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 Delete Ledger
export const deleteLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = req.user;
    const ledgerId = Number(req.params.id);

    const existing = await prisma.ledger.findUnique({
      where: { id: ledgerId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Ledger not found",
      });
    }

    const result = await prisma.ledger.delete({
      where: { id: ledgerId },
    });

    await prisma.ledgerLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        ledgerId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Ledger deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

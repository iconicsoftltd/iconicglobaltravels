import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// Create Unit
export const createUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findUnit = await prisma.unit.findFirst({ where: req.body });

    if (findUnit) {
      return res.status(400).json({ success: false, message: "Unit Already Exists" });
    }

    const result = await prisma.unit.create({ data: req.body });

    await prisma.unitLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        unitId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Unit Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Units
export const getUnitAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.UnitWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.unit.findMany({
      where: { branchId: Number(branchId), AND: whereCondition },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.unit.count({
      where: { branchId: Number(branchId), AND: whereCondition },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Units retrieved successfully",
      meta: { page, size: take, total, totalPage: Math.ceil(total / take) },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get Unit by ID
export const getUnitById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unitId = Number(req.params.id);
    if (!unitId) return res.status(400).json({ success: false, message: "Unit ID is missing" });

    const result = await prisma.unit.findFirst({ where: { id: unitId } });
    if (!result) return res.status(404).json({ success: false, message: "Unit not found" });

    res.status(200).json({ success: true, message: "Unit retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
};

// Update Unit
export const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const unitId = Number(req.params.id);
    const data = req.body;

    if (!unitId) return res.status(400).json({ success: false, message: "Unit ID is missing" });

    const existingUnit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!existingUnit) return res.status(404).json({ success: false, message: "Unit not found" });

    const result = await prisma.unit.update({ where: { id: unitId }, data });


    await prisma.unitLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        unitId: result.id,
        data: result,
        action: "UPDATED",
      }
    })

    res.status(200).json({ success: true, message: "Unit updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

// Delete Unit
export const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const unitId = Number(req.params.id);
    if (!unitId) return res.status(400).json({ success: false, message: "Unit ID is missing" });

    const result = await prisma.unit.delete({ where: { id: unitId } });

    await prisma.unitLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        unitId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({ success: true, message: "Unit deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
};

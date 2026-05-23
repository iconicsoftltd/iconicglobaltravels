import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// Create Color
export const createColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findColor = await prisma.color.findFirst({ where: req.body });

    if (findColor) {
      return res.status(400).json({ success: false, message: "Color Already Exists" });
    }

    const result = await prisma.color.create({ data: req.body });

    await prisma.colorLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        colorId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Color Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Colors
export const getColorAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch id is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.ColorWhereInput[] = [];
    if (skip < 0) skip = 0;

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.color.findMany({
      where: { branchId: Number(branchId), AND: whereCondition },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.color.count({
      where: { branchId: Number(branchId), AND: whereCondition },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Colors retrieved successfully",
      meta: { page, size: take, total, totalPage: Math.ceil(total / take) },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get Color by ID
export const getColorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colorId = Number(req.params.id);
    if (!colorId) return res.status(400).json({ success: false, message: "Color ID is missing" });

    const result = await prisma.color.findFirst({ where: { id: colorId } });
    if (!result) return res.status(404).json({ success: false, message: "Color not found" });

    res.status(200).json({ success: true, message: "Color retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
};

// Update Color
export const updateColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const colorId = Number(req.params.id);
    const data = req.body;

    if (!colorId) return res.status(400).json({ success: false, message: "Color ID is missing" });

    const existingColor = await prisma.color.findUnique({ where: { id: colorId } });
    if (!existingColor) return res.status(404).json({ success: false, message: "Color not found" });

    const result = await prisma.color.update({ where: { id: colorId }, data });


    await prisma.colorLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        colorId: result.id,
        data: result,
        action: "UPDATED",
      }
    })


    res.status(200).json({ success: true, message: "Color updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

// Delete Color
export const deleteColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const colorId = Number(req.params.id);
    if (!colorId) return res.status(400).json({ success: false, message: "Color ID is missing" });

    const result = await prisma.color.delete({ where: { id: colorId } });


    await prisma.colorLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        colorId: result.id,
        data: result,
        action: "DELETED",
      }
    })


    res.status(200).json({ success: true, message: "Color deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
};

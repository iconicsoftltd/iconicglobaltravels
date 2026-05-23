// src/controllers/service.controller.ts
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create Service
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const findService = await prisma.service.findFirst({
      where: {
        name: req.body.name,
        branchId: req.body.branchId,
      },
    });

    if (findService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists for this branch",
      });
    }

    const result = await prisma.service.create({
      data: req.body,
    });
    await prisma.serviceLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        serviceId: result.id,
        data: result,
        action: "CREATED"
      }
    })

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Service created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Services (with pagination, search, filter)
export const getServiceAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const whereCondition: Prisma.ServiceWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { name: { contains: search as string, } },
        ],
      });
    }

    const result = await prisma.service.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.service.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Services retrieved successfully",
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

// ✅ Get Service by ID
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceId = Number(req.params.id);

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is missing in the request parameters",
      });
    }

    const result = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Service
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const serviceId = Number(req.params.id);
    const { ...data } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is missing in the request parameters",
      });
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const result = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    await prisma.serviceLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        serviceId: result.id,
        data: result,
        action: "UPDATED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Service
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    const serviceId = Number(req.params.id);

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is missing in the request parameters",
      });
    }

    const result = await prisma.service.delete({
      where: { id: serviceId },
    });

    await prisma.serviceLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        serviceId: result.id,
        data: result,
        action: "DELETED",
      }
    })

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

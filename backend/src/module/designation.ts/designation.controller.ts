import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// create Designation variation
export const createDesignation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const findDesignation = await prisma.designation.findFirst({
            where: req.body
        })
        if (findDesignation) {
            return res.status(400).send({
                success: false,
                message: "Designation Already Exist"
            })
        }

        // Create Designation
        const result = await prisma.designation.create({
            data: req.body,
        });
        await prisma.designationLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                designationId: result.id,
                data: result,
                action: "CREATED"
            }
        })
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Designation Created Successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getDesignationAll = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, size, sortOrder, search, branchId } = req.query;
        if (!branchId) {
            return res.status(400).json({ status: false, message: "Branch id is required" })
        }
        let skip = parseInt(page as string) - 1 || 0;
        const take = parseInt(size as string) || 10;
        const order =
            (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

        const whereCondition: Prisma.DesignationWhereInput[] = [];
        if (skip < 0) {
            skip = 0;
        }
        if (search) {
            whereCondition.push({
                OR: [{ name: { contains: search as string } }],
            });
        }

        const result = await prisma.designation.findMany({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
            skip: skip * take,
            take,
            orderBy: {
                createdAt: "desc"
            }
        });

        const total = await prisma.designation.count({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Designation retrieved successfully",
            meta: {
                page: page,
                size: take,
                total,
                totalPage: Math.ceil(total / take)
            },
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get Designation by id
export const getDesignationById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const DesignationId = Number(req.params.id);

        if (!DesignationId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Designation ID is missing in the request parameters",
            });
        }

        const result = await prisma.designation.findFirst({
            where: {
                id: DesignationId,
            },
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Designation not found",
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Designation retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// update Designation
export const updateDesignation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const DesignationId = Number(req.params.id);
        const { ...data } = req.body;
        if (!DesignationId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Designation ID is missing in the request parameters",
            });
        }

        const existingDesignation = await prisma.designation.findUnique({
            where: {
                id: DesignationId,
            },
        });

        if (!existingDesignation) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Designation not found",
            });
        }

        const result = await prisma.designation.update({
            where: {
                id: DesignationId,
            },
            data: data,
        });

        await prisma.designationLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                designationId: result.id,
                data: result,
                action: "UPDATED",
            }
        })

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Designation updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// delete Designation Product
export const deleteDesignation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const DesignationId = Number(req.params.id);
        if (!DesignationId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Designation ID is missing in the request parameters",
            });
        }

        const result = await prisma.designation.delete({
            where: {
                id: DesignationId,
            },
        });

        await prisma.designationLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                designationId: result.id,
                data: result,
                action: "DELETED",
            }
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Designation deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

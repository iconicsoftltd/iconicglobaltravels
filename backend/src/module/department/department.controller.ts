import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// create Department variation
export const createDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const findDepartment = await prisma.department.findFirst({
            where: req.body
        })
        if (findDepartment) {
            return res.status(400).send({
                success: false,
                message: "Department Already Exist"
            })
        }

        // Create Department
        const result = await prisma.department.create({
            data: req.body,
        });
        await prisma.departmentLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                departmentId: result.id,
                data: result,
                action: "CREATED"
            }
        })
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Department Created Successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getDepartmentAll = async (
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

        const whereCondition: Prisma.DepartmentWhereInput[] = [];
        if (skip < 0) {
            skip = 0;
        }
        if (search) {
            whereCondition.push({
                OR: [{ name: { contains: search as string } }],
            });
        }

        const result = await prisma.department.findMany({
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

        const total = await prisma.department.count({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Department retrieved successfully",
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

// get Department by id
export const getDepartmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const DepartmentId = Number(req.params.id);

        if (!DepartmentId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Department ID is missing in the request parameters",
            });
        }

        const result = await prisma.department.findFirst({
            where: {
                id: DepartmentId,
            },
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Department not found",
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Department retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// update Department
export const updateDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const DepartmentId = Number(req.params.id);
        const { ...data } = req.body;
        if (!DepartmentId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Department ID is missing in the request parameters",
            });
        }

        const existingDepartment = await prisma.department.findUnique({
            where: {
                id: DepartmentId,
            },
        });

        if (!existingDepartment) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Department not found",
            });
        }

        const result = await prisma.department.update({
            where: {
                id: DepartmentId,
            },
            data: data,
        });
        await prisma.departmentLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                departmentId: result.id,
                data: result,
                action: "UPDATED",
            }
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Department updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// delete Department Product
export const deleteDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const DepartmentId = Number(req.params.id);
        if (!DepartmentId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Department ID is missing in the request parameters",
            });
        }

        const result = await prisma.department.delete({
            where: {
                id: DepartmentId,
            },
        });

        await prisma.departmentLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                departmentId: result.id,
                data: result,
                action: "DELETED",
            }
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Department deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

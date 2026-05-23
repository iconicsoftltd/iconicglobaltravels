import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// create Group variation
export const createGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const findGroup = await prisma.group.findFirst({
            where: req.body
        })
        if (findGroup) {
            return res.status(400).send({
                success: false,
                message: "Group Already Exist"
            })
        }

        // Create Group
        const result = await prisma.group.create({
            data: req.body,
        });

        await prisma.groupLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                groupId: result.id,
                data: result,
                action: "CREATED"
            }
        })

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Group Created Successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getGroupAll = async (
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

        const whereCondition: Prisma.GroupWhereInput[] = [];
        if (skip < 0) {
            skip = 0;
        }
        if (search) {
            whereCondition.push({
                OR: [{ accountType: { contains: search as string } }],
            });
        }

        const result = await prisma.group.findMany({
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

        const total = await prisma.group.count({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Group retrieved successfully",
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

// get Group by id
export const getGroupById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const GroupId = Number(req.params.id);

        if (!GroupId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Group ID is missing in the request parameters",
            });
        }

        const result = await prisma.group.findFirst({
            where: {
                id: GroupId,
            },
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Group not found",
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Group retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// update Group
export const updateGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const GroupId = Number(req.params.id);
        const { ...data } = req.body;
        if (!GroupId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Group ID is missing in the request parameters",
            });
        }

        const existingGroup = await prisma.group.findUnique({
            where: {
                id: GroupId,
            },
        });

        if (!existingGroup) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Group not found",
            });
        }

        const result = await prisma.group.update({
            where: {
                id: GroupId,
            },
            data: data,
        });

        await prisma.groupLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                groupId: result.id,
                data: result,
                action: "UPDATED",
            }
        })

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Group updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// delete Group Product
export const deleteGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const GroupId = Number(req.params.id);
        if (!GroupId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Group ID is missing in the request parameters",
            });
        }

        const result = await prisma.group.delete({
            where: {
                id: GroupId,
            },
        });

        await prisma.groupLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                groupId: result.id,
                data: result,
                action: "DELETED",
            }
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Group deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

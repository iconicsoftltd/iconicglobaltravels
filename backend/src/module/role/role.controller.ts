import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// create Role variation
export const createRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const { permissions, ...data } = req.body;
        const findRole = await prisma.role.findFirst({
            where: data
        })
        if (findRole) {
            return res.status(400).send({
                success: false,
                message: "Role Already Exist"
            })
        }
       
        // Create Role
        const result = await prisma.role.create({
            data: data,
        });
        await prisma.rolePermission.createMany({
            data: permissions.map((permission: { permissionId: number, isAllowed: boolean }) => ({
                roleId: result.id,
                permissionId: permission.permissionId,
                isAllowed: permission.isAllowed
            }))
        })

        await prisma.roleLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                roleId: result.id,
                data: { ...result, permissions },
                action: "CREATED"
            }
        })

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Role Created Successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const getRoleAll = async (
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

        const whereCondition: Prisma.RoleWhereInput[] = [];
        if (skip < 0) {
            skip = 0;
        }
        if (search) {
            whereCondition.push({
                OR: [{ name: { contains: search as string } }],
            });
        }

        const result = await prisma.role.findMany({
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

        const total = await prisma.role.count({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Role retrieved successfully",
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

// get Role by id
export const getRoleById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const RoleId = Number(req.params.id);

        if (!RoleId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Role ID is missing in the request parameters",
            });
        }

        const result = await prisma.role.findFirst({
            where: {
                id: RoleId,
            },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    }
                }
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Role not found",
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Role retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// update Role
export const updateRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const RoleId = Number(req.params.id);
        const { permissions, ...data } = req.body;
        if (!RoleId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Role ID is missing in the request parameters",
            });
        }

        const existingRole = await prisma.role.findUnique({
            where: { id: RoleId },
        });

        if (!existingRole) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Role not found",
            });
        }

        const result = await prisma.role.update({
            where: { id: RoleId },
            data: data,
        });

        if (permissions?.length) {
            // ✅ আগে সব delete করুন
            await prisma.rolePermission.deleteMany({
                where: { roleId: RoleId }
            });

            // ✅ তারপর নতুন করে create করুন
            await prisma.rolePermission.createMany({
                data: permissions.map((permission: { permissionId: number, isAllowed: boolean }) => ({
                    roleId: RoleId,
                    permissionId: permission.permissionId,
                    isAllowed: permission.isAllowed
                })),
                skipDuplicates: true, // ✅ duplicate হলে skip করবে
            });
        }

        await prisma.roleLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                roleId: result.id,
                data: { ...result, permissions },
                action: "UPDATED",
            }
        });

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Role updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// delete Role Product
export const deleteRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const RoleId = Number(req.params.id);
        if (!RoleId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Role ID is missing in the request parameters",
            });
        }
        const findRole = await prisma.role.findFirst({
            where: {
                id: RoleId,
            },
        });
        if (!findRole) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Role not found",
            });
        };
        if (findRole.isSystemRole) return res.status(400).json({ success: false, statusCode: 400, message: "System Role can't be deleted" })

        await prisma.rolePermission.deleteMany({
            where: {
                roleId: RoleId
            }
        })
        const result = await prisma.role.delete({
            where: {
                id: RoleId,
            },
        });

        await prisma.roleLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                roleId: result.id,
                data: result,
                action: "DELETED",
            }
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Role deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

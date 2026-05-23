import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// create UserPermission variation
export const createUserPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const { permissions, userId } = req.body;

        const result = await prisma.user.findFirst({
            where: {
                id: userId
            },
            include: {
                employee: true,
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found",
            });
        }
        await prisma.userPermission.deleteMany({
            where: {
                userId: userId
            }
        })
        await prisma.userPermission.createMany({
            data: permissions.map((permission: { permissionId: number, isAllowed: boolean }) => ({
                userId: userId,
                permissionId: permission.permissionId,
                isAllowed: permission.isAllowed
            }))
        });

        await prisma.userLog.create({
            data: {
                branchId: result.employee.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                userId: result.id,
                data: { ...result, permissions },
                action: "USER_PERMISSION_UPDATE",
            }
        })

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "User Permission Created Successfully",
        });
    } catch (err) {
        next(err);
    }
};



// get UserPermission by id
export const getUserPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = Number(req.params.id);

        const user = await prisma.user.findFirst({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        rolePermissions: { include: { permission: true } },
                    },
                },
                permissions: { include: { permission: true } },
                branches: { include: { branch: true } },
                employee: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }



        // 🧱 Step 1: Role-based permissions
        const rolePermissions = user.role.rolePermissions.map((rp) => ({
            id: rp.permission.id,
            module: rp.permission.module,
            action: rp.permission.action,
            isAllowed: rp.isAllowed,
        }));

        // 🧱 Step 2: User-specific permissions
        const userPermissions = user.permissions.map((up) => ({
            id: up.permission.id,
            module: up.permission.module,
            action: up.permission.action,
            isAllowed: up.isAllowed,
        }));

        // 🧱 Step 3: Merge Permissions (User permission overrides Role)
        const finalPermissions = new Map<string, { id: number; module: string; action: string; isAllowed: boolean }>();

        // Base Role Permissions
        for (const rp of rolePermissions) {
            finalPermissions.set(`${rp.module}_${rp.action}`, {
                id: rp.id,
                module: rp.module,
                action: rp.action,
                isAllowed: rp.isAllowed,
            });
        }

        // Override with User Permissions
        for (const up of userPermissions) {
            finalPermissions.set(`${up.module}_${up.action}`, {
                id: up.id,
                module: up.module,
                action: up.action,
                isAllowed: up.isAllowed,
            });
        }

        // 🧱 Step 4: Convert Map to Array
        const mergedPermissions = Array.from(finalPermissions.values());

        // 🧱 Step 5: Branch List
        const branches = user.branches.map((b) => ({
            id: b.branch.id,
            name: b.branch.name,
            address: b.branch.address,
        }));

        res.status(200).json({
            success: true,
            message: "Get User Permission Successfully",
            user: {
                id: user.id,
                name: user.employee.name,
                email: user.employee.email,
                role: user.role.name,
                branches,
                permissions: mergedPermissions,
            },
        });
    } catch (err) {
        next(err);
    }
};


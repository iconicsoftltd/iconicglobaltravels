import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getPermissionAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        interface Permission {
            module: string
            actions: {
                permissionId: number,
                action: string
            }[]
        }
        const allPermission: Permission[] = [];
        const result = await prisma.permission.findMany({});
        for (const permission of result) {
            const findPermission = allPermission.find((p) => p.module === permission.module);
            if (findPermission) {
                findPermission.actions.push({
                    permissionId: permission.id,
                    action: permission.action
                })
            } else {
                allPermission.push({
                    module: permission.module,
                    actions: [{
                        permissionId: permission.id,
                        action: permission.action
                    }]
                })
            }
        }
        res.status(200).json({
            success: true,
            message: "Permission List",
            data: allPermission
        })
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}
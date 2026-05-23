
import { Request, Response, NextFunction } from "express";
import prisma from "../../utils/prisma";

export const upsertSalaryStructure = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const { id } = req.user;
        const data = req.body;

        // ✅ Check if structure exists for this branch
        const existing = await prisma.salaryStructure.findFirst({
            where: { branchId: data.branchId },
        });

        let result;

        if (existing) {
            // 🔄 Update existing salary structure
            result = await prisma.salaryStructure.update({
                where: { id: existing.id },
                data: {
                    basicSalary: data.basicSalary,
                    houseRent: data.houseRent,
                    medical: data.medical,
                    transport: data.transport,
                    food: data.food,
                    casualLeave: data.casualLeave,
                    medicalLeave: data.medicalLeave,
                },
            });
        } else {
            // 🆕 Create new salary structure
            result = await prisma.salaryStructure.create({
                data,
            });
        }

        await prisma.salaryStructureLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                salaryStructureId: result.id,
                data: result,
                action: "UPDATED",
            }
        })

        res.status(200).json({
            success: true,
            message: existing
                ? "Salary structure updated successfully"
                : "Salary structure created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


export const getSalaryStructureByBranch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const branchId = req.query.branchId as string;

        if (!branchId) {
            return res
                .status(400)
                .json({ success: false, message: "Branch ID is required" });
        }

        const structure = await prisma.salaryStructure.findFirst({
            where: { branchId: Number(branchId) },
        });

        if (!structure) {
            return res
                .status(404)
                .json({ success: false, message: "No salary structure found" });
        }

        res.status(200).json({
            success: true,
            message: "Salary structure retrieved successfully",
            data: structure,
        });
    } catch (error) {
        next(error);
    }
};


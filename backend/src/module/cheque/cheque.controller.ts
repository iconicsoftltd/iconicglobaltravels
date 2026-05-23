import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// ✅ Create Cheque
export const createCheque = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { bankId, customerId, chequeNumber, branchId } = req.body;
        const findBank = await prisma.bank.findFirst({
            where: {
                id: bankId
            }
        })
        if (!findBank) {
            return res.status(400).json({ success: false, message: "Bank not found" })
        }
        const findCustomer = await prisma.particular.findFirst({
            where: {
                id: customerId
            }
        })
        if (!findCustomer) {
            return res.status(400).json({ success: false, message: "Customer not found" })
        }

        // Prevent duplicate cheque number within the same branch
        const existingCheque = await prisma.cheque.findFirst({
            where: { chequeNumber, branchId },
        });

        if (existingCheque) {
            return res.status(400).json({
                success: false,
                message: "Cheque already exists",
            });
        }

        const result = await prisma.cheque.create({
            data: req.body,
        });

        await prisma.chequeLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                status: result.status,
                chequeId: result.id,
                data: result,
                action: "CREATED"
            }
        })

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Cheque created successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Get All Cheques (with pagination, search)
export const getChequeAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, size, sortOrder, search, branchId, status, fromDate, toDate } = req.query;

        if (!branchId) {
            return res.status(400).json({ success: false, message: "Branch ID is required" });
        }

        let skip = parseInt(page as string) - 1 || 0;
        const take = parseInt(size as string) || 10;
        const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

        if (skip < 0) skip = 0;

        const whereCondition: Prisma.ChequeWhereInput[] = [];

        // ✅ Search by cheque number, bank name, or customer account type
        if (search) {
            whereCondition.push({
                OR: [
                    { chequeNumber: { contains: search as string, } },
                    { bank: { name: { contains: search as string, } } },
                    { customer: { accountType: { contains: search as string, } } },
                ],
            });
        }

        // ✅ Filter by status
        if (status) {
            whereCondition.push({ status: status as any });
        }

        // ✅ Filter by date (supports single date or range)
        if (fromDate && toDate) {

            const startDate = new Date(fromDate as string);
            const endDate = new Date(toDate as string);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.push({
                submitDate: {
                    gte: startDate,
                    lte: endDate,
                },
            });
        }

        // ✅ Fetch data with conditions
        const result = await prisma.cheque.findMany({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
            skip: skip * take,
            take,
            orderBy: { createdAt: order },
            include: {
                bank: true,
                customer: true,
            },
        });

        // ✅ Count total records
        const total = await prisma.cheque.count({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
        });

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Cheques retrieved successfully",
            meta: {
                page: Number(page) || 1,
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


// ✅ Get Cheque by ID
export const getChequeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chequeId = Number(req.params.id);

        if (!chequeId) {
            return res.status(400).json({
                success: false,
                message: "Cheque ID is missing in the request parameters",
            });
        }

        const result = await prisma.cheque.findFirst({
            where: { id: chequeId },
            include: {
                bank: true,
                customer: true,
                branch: true,
            },
        });
        const chequeLog = await prisma.chequeLog.findMany({
            where: { chequeId: chequeId },

        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Cheque not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cheque retrieved successfully",
            chequeLog,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Update Cheque
export const updateCheque = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const chequeId = Number(req.params.id);
        const { ...data } = req.body;

        if (!chequeId) {
            return res.status(400).json({
                success: false,
                message: "Cheque ID is missing in the request parameters",
            });
        }

        const existingCheque = await prisma.cheque.findUnique({
            where: { id: chequeId },
        });

        if (!existingCheque) {
            return res.status(404).json({
                success: false,
                message: "Cheque not found",
            });
        }

        const result = await prisma.cheque.update({
            where: { id: chequeId },
            data,
        });

        await prisma.chequeLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                status: result.status,
                chequeId: result.id,
                data: result,
                action: "UPDATED",
            }
        })

        res.status(200).json({
            success: true,
            message: "Cheque updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Cheque
export const deleteCheque = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const chequeId = Number(req.params.id);

        if (!chequeId) {
            return res.status(400).json({
                success: false,
                message: "Cheque ID is missing in the request parameters",
            });
        }

        const result = await prisma.cheque.delete({
            where: { id: chequeId },
        });
        await prisma.chequeLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                status: result.status,
                chequeId: result.id,
                data: result,
                action: "DELETED",
            }
        })

        res.status(200).json({
            success: true,
            message: "Cheque deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// Utility: calculate total days inclusive
const calculateDays = (from: Date, to: Date) => {
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// ✅ Create Leave Apply
export const createLeaveApply = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { employeeId, branchId, leaveId, fromDays, toDays, subject, content } = req.body;

        const fromDate = new Date(fromDays);
        const toDate = new Date(toDays);

        if (toDate < fromDate) {
            return res.status(400).json({
                success: false,
                message: "To date cannot be earlier than From date",
            });
        }

        // Calculate apply days
        const applyDays = calculateDays(fromDate, toDate);

        // Get leave type setup
        const leaveSetup = await prisma.leaveDaySetup.findFirst({
            where: { id: leaveId, branchId },
        });

        if (!leaveSetup) {
            return res.status(404).json({ success: false, message: "Leave type not found" });
        }

        // Calculate already approved leaves for this leave type
        const approvedLeaves = await prisma.leaveApply.aggregate({
            _sum: { approveDays: true },
            where: {
                leaveId,
                branchId,
                status: "Approved",
            },
        });

        const totalApproved = approvedLeaves._sum.approveDays || 0;

        // Calculate leave left
        const leaveLeft = leaveSetup.days - totalApproved;

        if (applyDays > leaveLeft) {
            return res.status(400).json({
                success: false,
                message: `You applied for ${applyDays} days, but only ${leaveLeft} leave days are left.`,
            });
        }

        const result = await prisma.leaveApply.create({
            data: {
                employeeId,
                branchId,
                leaveId,
                fromDays: fromDate,
                toDays: toDate,
                applyDays,
                leaveLeft,
                subject,
                content,
            },
        });

        await prisma.leaveApplyLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                leaveApplyId: result.id,
                data: result,
                action: "CREATED"
            }
        })

        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Leave application created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Update Leave Application (approve/reject)
export const updateLeaveApply = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const leaveId = Number(req.params.id);
        const { note, status, approveFromDate, approveToDate } = req.body;

        const existing = await prisma.leaveApply.findUnique({ where: { id: leaveId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        let data: any = { status };

        if (status === "Approved") {
            if (!approveFromDate || !approveToDate) {
                return res.status(400).json({
                    success: false,
                    message: "Approve dates are required when approving",
                });
            }

            const from = new Date(approveFromDate);
            const to = new Date(approveToDate);

            if (to < from) {
                return res.status(400).json({
                    success: false,
                    message: "Approve To Date cannot be earlier than Approve From Date",
                });
            }

            const approveDays = calculateDays(from, to);

            // Recalculate leaveLeft after approval
            const leaveSetup = await prisma.leaveDaySetup.findUnique({ where: { id: existing.leaveId } });

            const approvedLeaves = await prisma.leaveApply.aggregate({
                _sum: { approveDays: true },
                where: {
                    leaveId: existing.leaveId,
                    branchId: existing.branchId,
                    status: "Approved",
                },
            });

            const totalApproved = approvedLeaves._sum.approveDays || 0;

            const leaveLeft = (leaveSetup?.days || 0) - totalApproved;

            if (approveDays > leaveLeft) {
                return res.status(400).json({
                    success: false,
                    message: `You approved for ${approveDays} days, but only ${leaveLeft} leave days are left.`,
                });
            }
            data = {
                ...data,
                note,
                approveFromDate: from,
                approveToDate: to,
                approveDays,
            };
        }

        const result = await prisma.leaveApply.update({
            where: { id: leaveId },
            data,
        });

        await prisma.leaveApplyLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                leaveApplyId: result.id,
                data: result,
                action: "UPDATED",
            }
        })

        res.status(200).json({
            success: true,
            message: "Leave application updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


export const getLeaveApplyAll = async (
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

        const whereCondition: Prisma.LeaveApplyWhereInput[] = [];
        if (skip < 0) {
            skip = 0;
        }
        if (search) {
            whereCondition.push({
                OR: [{ employee: { name: { contains: search as string } } }],
            });
        }

        const result = await prisma.leaveApply.findMany({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
            include: {
                employee: {
                    select: {
                        name: true,
                    }
                },
                leaveType: true,
            },
            skip: skip * take,
            take,
            orderBy: {
                createdAt: "desc"
            }
        });

        const total = await prisma.leaveApply.count({
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
export const getLeaveApplyById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const applyId = Number(req.params.id);

        if (!applyId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Leave Apply ID is missing in the request parameters",
            });
        }

        const result = await prisma.leaveApply.findFirst({
            where: {
                id: applyId,
            },
            include: {
                employee: true,
                leaveType: true,
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Leave Apply not found",
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Leave Apply retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteLeaveApply = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.user;
        const applyId = Number(req.params.id);
        if (!applyId) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Leave Apply ID is missing in the request parameters",
            });
        }

        const result = await prisma.leaveApply.delete({
            where: {
                id: applyId,
            },
        });

        await prisma.leaveApplyLog.create({
            data: {
                branchId: result.branchId,
                ip: req.ip || "0.0.0.0",
                updatedById: id,
                leaveApplyId: result.id,
                data: result,
                action: "DELETED",
            }
        })
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Leave Apply deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

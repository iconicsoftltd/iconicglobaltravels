import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

// create UserBranch variation
export const createUserBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const findUserBranch = await prisma.userBranch.findFirst({
      where: req.body,
    });
    if (findUserBranch) {
      return res.status(400).send({
        success: false,
        message: "User Branch Already Exist",
      });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: req.body.branchId },
    });

    if (!branch) {
      throw new Error("Branch not found");
    }

    // Create UserBranch
    const result = await prisma.userBranch.create({
      data: req.body,
    });

    await prisma.branchAssignLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        branchAssignId: result.id,
        data: result,
        action: "CREATED",
      },
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User Branch Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserBranchAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;
    if (!branchId) {
      return res
        .status(400)
        .json({ status: false, message: "Branch id is required" });
    }
    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.UserBranchWhereInput[] = [];
    if (skip < 0) {
      skip = 0;
    }
    if (search) {
      whereCondition.push({
        OR: [{ user: { employee: { name: { contains: search as string } } } }],
      });
    }

    const result = await prisma.userBranch.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      select: {
        id: true,
        userId: true,
        branchId: true,
        branch: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
            employee: {
              select: {
                name: true,
                uuid: true,
                email: true,
              },
            },
          },
        },
      },
      skip: skip * take,
      take,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.userBranch.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User Branch retrieved successfully",
      meta: {
        page: page,
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

// get UserBranch by id
export const getUserBranchById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const UserBranchId = Number(req.params.id);

    if (!UserBranchId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User Branch ID is missing in the request parameters",
      });
    }

    const result = await prisma.userBranch.findFirst({
      where: {
        id: UserBranchId,
      },
      select: {
        userId: true,
        branchId: true,
        branch: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
            employee: {
              select: {
                name: true,
                uuid: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User Branch retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// update UserBranch
export const updateUserBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const UserBranchId = Number(req.params.id);
    const { ...data } = req.body;
    if (!UserBranchId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User Branch ID is missing in the request parameters",
      });
    }

    const existingUserBranch = await prisma.userBranch.findUnique({
      where: {
        id: UserBranchId,
      },
    });

    if (!existingUserBranch) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User Branch not found",
      });
    }

    const result = await prisma.userBranch.update({
      where: {
        id: UserBranchId,
      },
      data: data,
    });

    await prisma.branchAssignLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        branchAssignId: result.id,
        data: result,
        action: "UPDATED",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User Branch updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete UserBranch Product
export const deleteUserBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const UserBranchId = Number(req.params.id);
    if (!UserBranchId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User Branch ID is missing in the request parameters",
      });
    }

    const result = await prisma.userBranch.delete({
      where: {
        id: UserBranchId,
      },
    });

    await prisma.branchAssignLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        branchAssignId: result.id,
        data: result,
        action: "DELETED",
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User Branch deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

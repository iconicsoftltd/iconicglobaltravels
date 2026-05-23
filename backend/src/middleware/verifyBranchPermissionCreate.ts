import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prisma";

export const verifyBranchPermissionCreate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const { branchId } = req.body;

    if (!branchId || isNaN(Number(branchId)))
      return res
        .status(400)
        .json({ status: false, message: "Invalid branch id" });

    const findPermission = await prisma.userBranch.findFirst({
      where: {
        userId: id,
        branchId: Number(branchId),
      },
      include: {
        branch: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (findPermission && findPermission.branch.isActive) {
      return next();
    }
    return res
      .status(403)
      .json({ status: false, message: "Forbidden Branch permission" });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

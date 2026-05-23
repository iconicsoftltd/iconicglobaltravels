import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { setupDefaultAccounting } from "../../utils/accountHelper";
import prisma from "../../utils/prisma";
import sendMail from "../../utils/sendEmail";

// create Branch variation
export const createBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;

    const findOperationUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        employee: {
          select: {
            branch: {
              select: {
                name: true,
              },
            },
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!findOperationUser) {
      return res.status(400).send({
        success: false,
        message: "User Not Found",
      });
    }

    const findBranch = await prisma.branch.findFirst({
      where: {
        name: req.body.name,
      },
    });

    if (findBranch) {
      return res.status(400).send({
        success: false,
        message: "Branch Name Already Exist",
      });
    }

    const emailExist = await prisma.branch.findFirst({
      where: {
        email: req.body.email,
      },
    });

    if (emailExist) {
      return res.status(400).send({
        success: false,
        message: "Branch Email Already Exist",
      });
    }

    // Create Branch
    const result = await prisma.branch.create({
      data: req.body,
    });

    await prisma.branchLog.create({
      data: {
        updatedById: id,
        ip: req.ip || "0.0.0.0",
        branchId: req.user?.branchId,
        data: result,
        action: "CREATED",
      },
    });
    const findUser = await prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        employee: true,
      },
    });

    if (findUser) {
      await prisma.userBranch.create({
        data: {
          userId: findUser.id,
          branchId: result.id,
        },
      });
      const message = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
  <h2 style="color: #2c3e50;">Branch Opening Request</h2>

  <p>Hello,</p>
  <p>A new branch opening request has been submitted. Please review the details below:</p>

  <h3 style="color: #2c3e50; margin-top: 20px;">Operation User Information</h3>
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px; font-weight: bold;">Name:</td>
      <td style="padding: 8px;">${findOperationUser?.employee.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Email:</td>
      <td style="padding: 8px;">${findOperationUser?.employee.email}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Role:</td>
      <td style="padding: 8px;">${findOperationUser?.role.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Branch:</td>
      <td style="padding: 8px;">${findOperationUser?.employee.branch.name}</td>
    </tr>
  </table>

  <h3 style="color: #2c3e50; margin-top: 20px;">Opening Branch Information</h3>
  <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px; font-weight: bold;">Branch Name:</td>
      <td style="padding: 8px;">${result.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Address:</td>
      <td style="padding: 8px;">${result.address}</td>
    </tr>
  </table>

  <p>Please take necessary actions.</p>

  <p style="margin-top: 30px;">Thanks,<br/>System Notification</p>
</div>
`;

      await sendMail({
        email: req.body.email,
        message,
        subject: `Branch Opening Request From ${findOperationUser?.employee.branch.name}`,
      });
    }

    await setupDefaultAccounting(result.id);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Branch Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getBranchAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const { page, size, sortOrder, search } = req.query;
    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereCondition: Prisma.BranchWhereInput[] = [];
    if (skip < 0) {
      skip = 0;
    }

    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const findAssignBranch = await prisma.userBranch.findMany({
      where: {
        userId: id,
      },
      select: {
        branchId: true,
      },
    });

    if (findAssignBranch.length === 0) {
      return res.status(200).json({
        success: true,
        statusCode: 204,
        message: "Branch retrieved successfully",
        meta: {
          page: page,
          size: take,
          total: 0,
          totalPage: 0,
        },
        data: [],
      });
    }

    if (findAssignBranch.length) {
      whereCondition.push({
        id: {
          in: findAssignBranch.map((item) => item.branchId),
        },
      });
    }

    const result = await prisma.branch.findMany({
      where: {
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.branch.count({
      where: {
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Branch retrieved successfully",
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

// get Branch by id
export const getBranchById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const BranchId = Number(req.params.id);

    if (!BranchId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Branch ID is missing in the request parameters",
      });
    }

    const result = await prisma.branch.findFirst({
      where: {
        id: BranchId,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Branch retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// update Branch
export const updateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const BranchId = Number(req.params.id);
    const { ...data } = req.body;
    if (!BranchId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Branch ID is missing in the request parameters",
      });
    }

    const existingBranch = await prisma.branch.findUnique({
      where: {
        id: BranchId,
      },
    });

    if (!existingBranch) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Branch not found",
      });
    }

    const result = await prisma.branch.update({
      where: {
        id: BranchId,
      },
      data: data,
    });
    await prisma.branchLog.create({
      data: {
        updatedById: id,
        ip: req.ip || "0.0.0.0",
        branchId: req.user?.branchId,
        data: result,
        action: "UPDATED",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Branch updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete Branch Product
export const deleteBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user;
    const BranchId = Number(req.params.id);

    if (!BranchId) {
      return res.status(400).json({
        success: false,
        message: "Branch ID is missing",
      });
    }

    // 🔍 Check usage
    const usageCounts = await prisma.$transaction([
      prisma.employee.count({ where: { branchId: BranchId } }),
      prisma.product.count({ where: { branchId: BranchId } }),
      prisma.purchase.count({ where: { branchId: BranchId } }),
      prisma.sale.count({ where: { branchId: BranchId } }),
      prisma.service.count({ where: { branchId: BranchId } }),
    ]);

    const isUsed = usageCounts.some((count) => count > 0);

    if (isUsed) {
      return res.status(409).json({
        success: false,
        message:
          "Branch cannot be deleted because it is already used in the system",
      });
    }

    // ❌ Safe to delete
    await prisma.userBranch.deleteMany({
      where: { branchId: BranchId },
    });

    const result = await prisma.branch.delete({
      where: { id: BranchId },
    });

    await prisma.branchLog.create({
      data: {
        updatedById: userId,
        ip: req.ip || "0.0.0.0",
        branchId: req.user?.branchId,
        data: result,
        action: "DELETED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

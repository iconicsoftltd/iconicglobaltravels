import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

const descriptionMap: Record<string, Function> = {
  CREATED: (name: string) => `Created branch '${name}'`,
  UPDATED: (name: string) => `Updated branch '${name}'`,
  DELETED: (name: string) => `Deleted branch '${name}'`,
};

const formatAuditLogs = (logs: any[]) => {
  return logs.map((log) => {
    const name = log.data?.name || "Unknown";

    return {
      id: log.id,
      date: log.createdAt,
      action: log.action,
      module: "Branch",
      entity: "Branch",
      description: descriptionMap[log.action]?.(name) || "",
      ip: log.ip,
    };
  });
};

export const getBranchLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.branchLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
      select: {
        id: true,
        ip: true,
        action: true,
        data: true,
        createdAt: true,
      },
    });

    const total = await prisma.branchLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Branch Logs retrieved successfully",
      meta: {
        page,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: formatAuditLogs(result),
    });
  } catch (error) {
    next(error);
  }
};

export const getBranchLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.branchLog.findFirst({
      where: { id: id },
    });

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Branch Log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.departmentLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.departmentLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Department Logs retrieved successfully",
      meta: {
        page,
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

export const getDepartmentLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.branchLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Department Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Department Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getDesignationLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.designationLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.designationLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Designation Logs retrieved successfully",
      meta: {
        page,
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

export const getDesignationLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.designationLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Designation Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Designation Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getChequeLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.chequeLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.chequeLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cheque Logs retrieved successfully",
      meta: {
        page,
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

export const getChequeLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.chequeLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Cheque Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Cheque Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getVoucherLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.voucherAudit.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.voucherAudit.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Voucher Logs retrieved successfully",
      meta: {
        page,
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

export const getVoucherLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.voucherAudit.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Voucher Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.userId || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Voucher Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getEmployeeLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.employeeLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.employeeLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Employee Logs retrieved successfully",
      meta: {
        page,
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

export const getEmployeeLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.employeeLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Employee Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Employee Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getRoleLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.roleLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.roleLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Role Logs retrieved successfully",
      meta: {
        page,
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

export const getRoleLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.roleLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Role Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Role Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.userLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.userLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User Logs retrieved successfully",
      meta: {
        page,
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

export const getUserLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.userLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "User Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getBranchAssignLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.branchAssignLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.branchAssignLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Branch Assign Logs retrieved successfully",
      meta: {
        page,
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

export const getBranchAssignLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.branchAssignLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Branch Assign Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Branch Assign Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getGroupLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.groupLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.groupLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Group Logs retrieved successfully",
      meta: {
        page,
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

export const getGroupLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.groupLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Group Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Group Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getLedgerLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.ledgerLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.ledgerLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledger Logs retrieved successfully",
      meta: {
        page,
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

export const getLedgerLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.ledgerLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Ledger Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Ledger Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getParticularLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.particularLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.particularLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Particular Logs retrieved successfully",
      meta: {
        page,
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

export const getParticularLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.particularLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Particular Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Particular Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getBankLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.bankLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.bankLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Bank Logs retrieved successfully",
      meta: {
        page,
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

export const getBankLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.bankLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Bank Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Bank Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getSubCategoryLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.productSubCategoryLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.productSubCategoryLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sub Category Logs retrieved successfully",
      meta: {
        page,
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

export const getSubCategoryLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.productSubCategoryLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sub Category Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Sub Category Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getUnitLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.unitLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.unitLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Unit Logs retrieved successfully",
      meta: {
        page,
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

export const getUnitLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.unitLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Unit Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Unit Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getBrandLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.brandLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.brandLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Brand Logs retrieved successfully",
      meta: {
        page,
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

export const getBrandLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.brandLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Brand Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Brand Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getProductLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.productLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.productCategoryLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product Logs retrieved successfully",
      meta: {
        page,
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

export const getProductLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.productLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Product Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getSizeLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.sizeLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.sizeLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Size Logs retrieved successfully",
      meta: {
        page,
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

export const getSizeLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.sizeLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Size Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Size Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getColorLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.colorLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.colorLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Color Logs retrieved successfully",
      meta: {
        page,
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

export const getColorLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.colorLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Color Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Color Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getProductVariationLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.productVariationLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.productVariationLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product Variation Logs retrieved successfully",
      meta: {
        page,
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

export const getProductVariationLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.productVariationLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product Variation Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Product Variation Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getPurchaseLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.purchaseLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.purchaseLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Purchase Logs retrieved successfully",
      meta: {
        page,
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

export const getPurchaseLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.purchaseLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Purchase Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Purchase Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getPurchaseReturnLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.purchaseReturnLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.purchaseReturnLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Purchase Return Logs retrieved successfully",
      meta: {
        page,
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

export const getPurchaseReturnLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.purchaseReturnLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Purchase Return Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Purchase Return Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getSalesLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.salesLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.salesLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sales Logs retrieved successfully",
      meta: {
        page,
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

export const getSalesLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.salaryLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sales Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Sales Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getSalesReturnLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.salesReturnLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.salesReturnLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sales Return Logs retrieved successfully",
      meta: {
        page,
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

export const getSalesReturnLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.salesReturnLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sales Return Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Sales Return Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getQuotationLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.quotationLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.quotationLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Quotation Logs retrieved successfully",
      meta: {
        page,
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

export const getQuotationLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.quotationLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Quotation Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Quotation Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};
export const getCategoryLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.productCategoryLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.productCategoryLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category Logs retrieved successfully",
      meta: {
        page,
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

export const getCategoryLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.productCategoryLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Category Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.serviceLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.serviceLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service Logs retrieved successfully",
      meta: {
        page,
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

export const getServiceLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.serviceLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Service Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Service Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceSalesLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.serviceSalesLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.serviceSalesLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service Sales Logs retrieved successfully",
      meta: {
        page,
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

export const getServiceSalesLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.serviceSalesLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Service Sales Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Service Sales Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaveDaySetupLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.leaveDaySetupLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.leaveDaySetupLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Leave Day Setup Logs retrieved successfully",
      meta: {
        page,
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

export const getLeaveDaySetupLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.leaveDaySetupLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Leave Day Setup Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Leave Day Setup Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaveApplyLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.leaveApplyLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.leaveApplyLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Leave Apply Logs retrieved successfully",
      meta: {
        page,
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

export const getLeaveApplyLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.leaveApplyLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Leave Apply Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Leave Apply Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getSalaryStructureLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.salaryStructureLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.salaryStructureLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Salary Structure Logs retrieved successfully",
      meta: {
        page,
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

export const getSalaryStructureLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.salaryStructureLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Salary Structure Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Salary Structure Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

export const getSalaryLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size, sortOrder, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    if (skip < 0) skip = 0;

    const result = await prisma.salaryLog.findMany({
      where: {
        branchId: Number(branchId),
      },
      omit: {
        data: true,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.salaryLog.count({
      where: {
        branchId: Number(branchId),
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Salary Logs retrieved successfully",
      meta: {
        page,
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

export const getSalaryLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is missing in the request parameters",
      });
    }

    const result = await prisma.salaryLog.findFirst({
      where: { id: id },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Salary Log not found",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: result?.updatedById || 0 },
      select: {
        role: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
            email: true,
            phone: true,
            department: {
              select: {
                name: true,
              },
            },
            designation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Salary Log retrieved successfully",
      data: { ...result, user: user },
    });
  } catch (err) {
    next(err);
  }
};

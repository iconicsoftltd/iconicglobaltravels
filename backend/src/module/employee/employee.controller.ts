import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";
import { ICreateEmployee } from "./employee.validation";

const generateEmployeeId = async (branchId: number) => {
  const findEmployee = await prisma.employee.findFirst({
    where: {
      branchId,
    },
    orderBy: {
      id: "desc",
    },
    select: {
      uuid: true,
    },
  });
  let uuid = null;
  if (!findEmployee) {
    uuid = `EMP-${branchId}001`;
  } else {
    uuid = `EMP-${Number(findEmployee.uuid.split("-")[1]) + 1}`;
  }
  return uuid;
};
// create Employee variation
export const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;

    let body = req.body as ICreateEmployee;

    const emailExist = await prisma.employee.findFirst({
      where: {
        email: body.email,
      },
    });

    if (emailExist) {
      return res.status(400).send({
        success: false,
        message: "Employee Email Already Exist",
      });
    }

    const nameExist = await prisma.employee.findFirst({
      where: {
        name: body.name,
      },
    });

    if (nameExist) {
      return res.status(400).send({
        success: false,
        message: "Employee Name Already Exist",
      });
    }

    req.body.uuid = await generateEmployeeId(body.branchId);

    // Create Employee
    const result = await prisma.employee.create({
      data: req.body,
    });

    await prisma.employeeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        employeeId: result.id,
        data: result,
        action: "CREATED",
      },
    });

    const salaryExpenseLedger = await prisma.ledger.findFirst({
      where: {
        ledgerType: "Salary Expense",
        branchId: result.branchId,
      },
    });
    if (salaryExpenseLedger) {
      await prisma.particular.create({
        data: {
          employeeId: result.id,
          email: result.email,
          address: result.address,
          mobileNumber: result.phone,
          salary: result.salary,
          accountType: result.name,
          balance: 0,
          type: "Credit",
          openingBalance: 0,
          openingBalanceType: "Credit",
          ledgerId: salaryExpenseLedger.id,
          branchId: result.branchId,
        },
      });
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Employee Created Successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeAll = async (
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

    const whereCondition: Prisma.EmployeeWhereInput[] = [];
    if (skip < 0) {
      skip = 0;
    }
    if (search) {
      whereCondition.push({
        OR: [{ name: { contains: search as string } }],
      });
    }

    const result = await prisma.employee.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.employee.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Employee retrieved successfully",
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

// get Employee by id
export const getEmployeeById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const EmployeeId = Number(req.params.id);

    if (!EmployeeId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Employee ID is missing in the request parameters",
      });
    }

    const result = await prisma.employee.findFirst({
      where: {
        id: EmployeeId,
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Employee retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// update Employee
export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const EmployeeId = Number(req.params.id);

    const { ...data } = req.body;
    if (!EmployeeId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Employee ID is missing in the request parameters",
      });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: EmployeeId,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Employee not found",
      });
    }

    const result = await prisma.employee.update({
      where: {
        id: EmployeeId,
      },
      data: data,
    });

    await prisma.employeeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        employeeId: result.id,
        data: result,
        action: "UPDATED",
      },
    });

    const findParticular = await prisma.particular.findFirst({
      where: {
        employeeId: result.id,
      },
    });
    if (findParticular) {
      await prisma.particular.update({
        where: {
          id: findParticular.id,
        },
        data: {
          email: result.email,
          address: result.address,
          mobileNumber: result.phone,
          salary: result.salary,
          accountType: result.name,
        },
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Employee updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const updateEmployeeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const EmployeeId = Number(req.params.id);

    if (!EmployeeId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Employee ID is missing in the request parameters",
      });
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id: EmployeeId,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Employee not found",
      });
    }

    const result = await prisma.employee.update({
      where: {
        id: EmployeeId,
      },
      data: {
        isActive: !existingEmployee.isActive,
      },
    });

    await prisma.employeeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        employeeId: result.id,
        data: result,
        action: "UPDATED_STATUS",
      },
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Employee updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// delete Employee Product
export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user;
    const EmployeeId = Number(req.params.id);
    if (!EmployeeId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Employee ID is missing in the request parameters",
      });
    }

    const result = await prisma.employee.delete({
      where: {
        id: EmployeeId,
      },
    });

    await prisma.employeeLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        employeeId: result.id,
        data: result,
        action: "DELETED",
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Employee deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

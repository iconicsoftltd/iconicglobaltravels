import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createParticular = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const {
      branchId,
      ledgerId,
      type,
      openingBalance = 0,
      openingBalanceDate,
      companyName,
      accountType,
      mobileNumber,
      email,
      address,
    } = req.body;

    const exists = await prisma.particular.findFirst({
      where: {
        branchId,
        ledgerId,
        accountType,
      },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Particular with same Ledger & type already exists",
      });
    }
    const particular = await prisma.particular.create({
      data: {
        branchId,
        ledgerId,
        type,
        balance: openingBalance,
        openingBalance,
        openingBalanceType: type,
        openingBalanceDate: openingBalanceDate
          ? new Date(openingBalanceDate)
          : new Date(),
        companyName,
        accountType,
        mobileNumber,
        email,
        address,
      },
      include: {
        ledger: true,
      },
    });

    await prisma.particularLog.create({
      data: {
        branchId: particular.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        particularId: particular.id,
        data: particular,
        action: "CREATED",
      },
    });

    res.status(201).json({
      success: true,
      message: "Particular created successfully",
      data: particular,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getAllParticulars = async (req: Request, res: Response) => {
  try {
    const { page, size, search, branchId, groupAccountId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.ParticularWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { accountType: { contains: search as string } },
          { companyName: { contains: search as string } },
        ],
      });
    }

    const particulars = await prisma.particular.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    const total = await prisma.particular.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
      meta: {
        page: Number(page) || 1,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: particulars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particulars", error });
  }
};



export const getParticularsForSelectService = async (
  req: Request, res: Response
) => {




  console.log({ query: req.query });




  const branchId = Number(req.query.branchId);
  const search = req.query?.search as string;


  if (!branchId) {
    res.status(400).send({ success: false, message: "Branch ID is required!" })
  }



  const data = await prisma.particular.findMany({
    where: {
      branchId,
      ...(search && {
        OR: [
          { accountType: { contains: search } },
        ],
      }),
    },
    select: {
      id: true,
      accountType: true,
      balance: true,
    },
    orderBy: {
      accountType: "asc",
    },
    take: 50, // limit for dropdown performance
  });




  // 🔥 Transform for select option
  const results = data.map((item) => ({
    label: item.accountType,
    value: item.id,
    balance: item.balance
  }));


  res.send({ success: true, data: results })


};



export const getAllSupplier = async (req: Request, res: Response) => {
  try {
    const { page, size, search, branchId, groupAccountId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.ParticularWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { accountType: { contains: search as string } },
          { companyName: { contains: search as string } },
        ],
      });
    }

    const particulars = await prisma.particular.findMany({
      where: {
        ledger: {
          ledgerType: "Accounts Payable",
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    const total = await prisma.particular.count({
      where: {
        ledger: {
          ledgerType: "Accounts Payable",
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
      meta: {
        page: Number(page) || 1,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: particulars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particulars", error });
  }
};
export const getAllCustomer = async (req: Request, res: Response) => {
  try {
    const { page, size, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.ParticularWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { accountType: { contains: search as string } },
          { companyName: { contains: search as string } },
        ],
      });
    }

    const particulars = await prisma.particular.findMany({
      where: {
        ledger: {
          ledgerType: "Accounts Receivable",
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    const total = await prisma.particular.count({
      where: {
        ledger: {
          ledgerType: "Accounts Receivable",
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
      meta: {
        page: Number(page) || 1,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: particulars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particulars", error });
  }
};
export const getAllEmployee = async (req: Request, res: Response) => {
  try {
    const { page, size, search, branchId, groupAccountId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.ParticularWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { accountType: { contains: search as string } },
          { companyName: { contains: search as string } },
        ],
      });
    }

    const particulars = await prisma.particular.findMany({
      where: {
        ledger: {
          ledgerType: "Salary Expense",
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    const total = await prisma.particular.count({
      where: {
        ledger: {
          ledgerType: "Salary Expense",
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
      meta: {
        page: Number(page) || 1,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: particulars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particulars", error });
  }
};
export const getAllExpenseParticular = async (req: Request, res: Response) => {
  try {
    const { page, size, search, branchId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.ParticularWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { accountType: { contains: search as string } },
          { companyName: { contains: search as string } },
        ],
      });
    }

    const particulars = await prisma.particular.findMany({
      where: {
        ledger: {
          group: {
            account: "Expense",
          },
          ledgerType: {
            not: "Purchase",
          },
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    const total = await prisma.particular.count({
      where: {
        ledger: {
          group: {
            account: "Expense",
          },
          ledgerType: {
            not: "Purchase",
          },
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
      meta: {
        page: Number(page) || 1,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: particulars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particulars", error });
  }
};
export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const { page, size, search, branchId, groupAccountId } = req.query;

    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;

    const whereCondition: Prisma.ParticularWhereInput[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          { accountType: { contains: search as string } },
          { companyName: { contains: search as string } },
        ],
      });
    }

    const particulars = await prisma.particular.findMany({
      where: {
        ledger: {
          ledgerType: {
            in: ["Petty Cash", "Cash In Hand", "Cash At Bank"],
          },
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    const total = await prisma.particular.count({
      where: {
        ledger: {
          ledgerType: {
            in: ["Petty Cash", "Cash In Hand", "Cash At Bank"],
          },
        },
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Ledgers retrieved successfully",
      meta: {
        page: Number(page) || 1,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: particulars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particulars", error });
  }
};

export const getParticularById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await prisma.particular.findUnique({
      where: { id: Number(id) },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Particular not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Particular retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch particular", error });
  }
};

export const updateParticular = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const particularId = Number(req.params.id);
    const { ...data } = req.body;

    const existing = await prisma.particular.findUnique({
      where: { id: particularId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Particular not found",
      });
    }

    const result = await prisma.particular.update({
      where: { id: particularId },
      data: {
        ...data,
      },
    });

    await prisma.particularLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        particularId: result.id,
        data: result,
        action: "UPDATED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Particular updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update particular", error });
  }
};

export const deleteParticular = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const particularId = Number(req.params.id);

    const existing = await prisma.particular.findUnique({
      where: { id: particularId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Particular not found",
      });
    }

    const result = await prisma.particular.delete({
      where: { id: particularId },
    });

    await prisma.particularLog.create({
      data: {
        branchId: result.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: id,
        particularId: result.id,
        data: result,
        action: "DELETED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Particular deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete particular", error });
  }
};

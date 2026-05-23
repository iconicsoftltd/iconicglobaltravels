import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createSalary = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user;

    const {
      branchId,
      employeeId,
      date,
      month,
      year,
      paymentAccountId,

      grossSalary,
      weekendAllowance = 0,
      holidayAllowance = 0,
      bonus = 0,

      provident = 0,
      advance = 0,
      lateFee = 0,
      absentFee = 0,
      unauthorizedLeave = 0,
      deduct = 0,

      note,
    } = req.body;

    const salaryDate = new Date(date);

    const paymentAmount =
      grossSalary +
      weekendAllowance +
      holidayAllowance +
      bonus -
      provident -
      advance -
      lateFee -
      absentFee -
      unauthorizedLeave -
      deduct;

    const salary = await prisma.$transaction(async (tx) => {
      //
      const employee = await tx.particular.findUnique({
        where: { id: employeeId },
        include: { ledger: true },
      });
      if (!employee) throw new Error("Employee not found");

      //
      const exists = await tx.salary.findFirst({
        where: { branchId, employeeId, month, year },
      });
      if (exists) throw new Error("Salary already generated for this month");

      // 3️⃣ Payment account
      const paymentAccount = await tx.particular.findUnique({
        where: { id: paymentAccountId },
        include: { ledger: { include: { group: true } } },
      });
      if (!paymentAccount) throw new Error("Payment account not found");
      if (paymentAccount.ledger.group.account !== "Assets") {
        throw new Error("Payment account must be Asset");
      }

      // 4️⃣ Salary Expense Ledger
      const salaryLedger = employee.ledger;
      if (!salaryLedger) {
        throw new Error("Employee ledger not found");
      }

      // 5️⃣ Create Salary
      const salaryRecord = await tx.salary.create({
        data: {
          branchId,
          employeeId,
          month,
          year,
          grossSalary,
          weekendAllowance,
          holidayAllowance,
          bonus,
          provident,
          advance,
          lateFee,
          absentFee,
          unauthorizedLeave,
          deduct,
          paymentAccountId,
          paymentAmount,
          note,
          createdById: userId,
        },
      });

      // 6️⃣ Create Voucher
      const lastVoucher = await tx.voucher.findFirst({
        where: { branchId },
        orderBy: { id: "desc" },
      });
      const voucherNo = `SAL-${branchId}-${(lastVoucher?.id || 0) + 1}`;

      const voucher = await tx.voucher.create({
        data: {
          salaryId: salaryRecord.id,
          branchId,
          voucherNo,
          type: "PAYMENT",
          date: salaryDate,
          narration: `Salary payment of ${employee.accountType} (${month}/${year})`,
        },
      });

      // 7️⃣ Accounting entries

      // Debit Salary Expense
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: employee.id,
          type: "Debit",
          amount: paymentAmount,
        },
      });
      await tx.particular.update({
        where: { id: employee.id },
        data: { balance: { increment: paymentAmount } },
      });
      await tx.ledger.update({
        where: { id: salaryLedger.id },
        data: { balance: { increment: paymentAmount } },
      });

      // Credit Cash/Bank
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: paymentAccount.id,
          type: "Credit",
          amount: paymentAmount,
        },
      });
      await tx.particular.update({
        where: { id: paymentAccount.id },
        data: { balance: { decrement: paymentAmount } },
      });
      await tx.ledger.update({
        where: { id: paymentAccount.ledgerId },
        data: { balance: { decrement: paymentAmount } },
      });

      // 9️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId,
          action: "CREATE",
          description: `Salary paid to ${employee.accountType}`,
          data: { salary: salaryRecord },
        },
      });

      return salaryRecord;
    });

    await prisma.salaryLog.create({
      data: {
        branchId: salary.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: userId,
        salaryId: salary.id,
        data: { salary: salary, body: req.body },
        action: "CREATED",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Salary created successfully",
      data: salary,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSalary = async (req: Request, res: Response) => {
  try {
    const salaryId = Number(req.params.id);
    const { id: userId } = req.user;

    const {
      branchId,
      date,
      paymentAccountId,
      employeeId,
      grossSalary,
      weekendAllowance = 0,
      holidayAllowance = 0,
      bonus = 0,

      provident = 0,
      advance = 0,
      lateFee = 0,
      absentFee = 0,
      unauthorizedLeave = 0,
      deduct = 0,

      note,
    } = req.body;

    const salaryDate = new Date(date);

    const paymentAmount =
      grossSalary +
      weekendAllowance +
      holidayAllowance +
      bonus -
      provident -
      advance -
      lateFee -
      absentFee -
      unauthorizedLeave -
      deduct;

    const updatedSalary = await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch existing salary + voucher
      const salary = await tx.salary.findUnique({
        where: { id: salaryId },
      });
      if (!salary) throw new Error("Salary not found");

      const voucher = await tx.voucher.findFirst({
        where: { salaryId: salaryId },
      });
      if (!voucher) throw new Error("Salary voucher not found");

      // 2️⃣ Revert old accounting entries
      const oldEntries = await tx.particularOnVoucher.findMany({
        where: { voucherId: voucher.id },
        include: {
          particular: {
            include: {
              ledger: { include: { group: true } },
            },
          },
        },
      });

      for (const entry of oldEntries) {
        const ledgerType = entry.particular.ledger.group.account;
        let updateData: any;

        if (entry.type === "Debit") {
          updateData =
            ledgerType === "Assets" || ledgerType === "Expense"
              ? { decrement: entry.amount }
              : { increment: entry.amount };
        } else {
          updateData =
            ledgerType === "Assets" || ledgerType === "Expense"
              ? { increment: entry.amount }
              : { decrement: entry.amount };
        }

        await tx.particular.update({
          where: { id: entry.particularId },
          data: { balance: updateData },
        });

        await tx.ledger.update({
          where: { id: entry.particular.ledgerId },
          data: { balance: updateData },
        });
      }

      // 3️⃣ Delete old voucher entries
      await tx.particularOnVoucher.deleteMany({
        where: { voucherId: voucher.id },
      });

      // 4️⃣ Update salary main record
      const updatedSalaryRecord = await tx.salary.update({
        where: { id: salaryId },
        data: {
          grossSalary,
          weekendAllowance,
          holidayAllowance,
          bonus,
          provident,
          advance,
          lateFee,
          absentFee,
          unauthorizedLeave,
          deduct,
          paymentAccountId,
          paymentAmount,
          note,
        },
      });

      const employee = await tx.particular.findUnique({
        where: { id: employeeId },
        include: { ledger: true },
      });
      if (!employee) throw new Error("Employee not found");

      // 5️⃣ Fetch ledgers
      const salaryLedger = employee.ledger;
      if (!salaryLedger) {
        throw new Error("Employee ledger not found");
      }

      const paymentAccount = await tx.particular.findUnique({
        where: { id: paymentAccountId },
        include: { ledger: true },
      });
      if (!paymentAccount) throw new Error("Payment account not found");

      // 6️⃣ Re-create accounting entries

      // Debit Salary Expense
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: employee.id,
          type: "Debit",
          amount: paymentAmount,
        },
      });
      await tx.particular.update({
        where: { id: employee.id },
        data: { balance: { increment: paymentAmount } },
      });
      await tx.ledger.update({
        where: { id: salaryLedger.id },
        data: { balance: { increment: paymentAmount } },
      });

      // Credit Cash/Bank
      await tx.particularOnVoucher.create({
        data: {
          voucherId: voucher.id,
          particularId: paymentAccount.id,
          type: "Credit",
          amount: paymentAmount,
        },
      });
      await tx.particular.update({
        where: { id: paymentAccount.id },
        data: { balance: { decrement: paymentAmount } },
      });
      await tx.ledger.update({
        where: { id: paymentAccount.ledgerId },
        data: { balance: { decrement: paymentAmount } },
      });

      // 7️⃣ Update voucher info
      await tx.voucher.update({
        where: { id: voucher.id },
        data: {
          date: salaryDate,
          narration: `Updated salary payment (${salary.month}/${salary.year})`,
        },
      });

      // 8️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          userId,
          action: "UPDATE",
          description: `Salary updated (ID: ${salaryId})`,
          data: { salary: updatedSalaryRecord },
        },
      });

      return updatedSalaryRecord;
    });

    await prisma.salaryLog.create({
      data: {
        branchId: updatedSalary.branchId,
        ip: req.ip || "0.0.0.0",
        updatedById: userId,
        salaryId: updatedSalary.id,
        data: { salary: updatedSalary, body: req.body },
        action: "UPDATED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Salary updated successfully",
      data: updatedSalary,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSalary = async (req: Request, res: Response) => {
  try {
    const salaryId = Number(req.params.id);
    const { id: userId } = req.user;

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Salary
      const salary = await tx.salary.findUnique({
        where: { id: salaryId },
      });
      if (!salary) throw new Error("Salary not found");

      // 2️⃣ Voucher
      const voucher = await tx.voucher.findFirst({
        where: { salaryId: salaryId },
      });

      if (voucher) {
        // 3️⃣ Revert accounting entries
        const entries = await tx.particularOnVoucher.findMany({
          where: { voucherId: voucher.id },
          include: {
            particular: {
              include: {
                ledger: { include: { group: true } },
              },
            },
          },
        });

        for (const entry of entries) {
          const ledgerType = entry.particular.ledger.group.account;
          let updateData: any;

          if (entry.type === "Debit") {
            updateData =
              ledgerType === "Assets" || ledgerType === "Expense"
                ? { decrement: entry.amount }
                : { increment: entry.amount };
          } else {
            updateData =
              ledgerType === "Assets" || ledgerType === "Expense"
                ? { increment: entry.amount }
                : { decrement: entry.amount };
          }

          await tx.particular.update({
            where: { id: entry.particularId },
            data: { balance: updateData },
          });

          await tx.ledger.update({
            where: { id: entry.particular.ledgerId },
            data: { balance: updateData },
          });
        }

        // 4️⃣ Delete voucher entries + voucher
        await tx.particularOnVoucher.deleteMany({
          where: { voucherId: voucher.id },
        });
        await tx.voucher.delete({
          where: { id: voucher.id },
        });
      }

      // 5️⃣ Delete salary
      await tx.salary.delete({
        where: { id: salaryId },
      });

      // 6️⃣ Audit
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher?.id || 0,
          branchId: salary.branchId,
          userId,
          action: "DELETE",
          description: `Salary deleted (ID: ${salaryId})`,
          data: { salary },
        },
      });

      return { salary, voucher };
    });

    await prisma.salaryLog.create({
      data: {
        branchId: result.salary.branchId || 0,
        ip: req.ip || "0.0.0.0",
        updatedById: userId,
        salaryId: result.salary.id,
        data: result,
        action: "DELETED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Salary deleted successfully",
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getSalaryAll = async (req: Request, res: Response) => {
  try {
    const { page, size, sortOrder, search, branchId, month, year } = req.query;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Branch id is required",
      });
    }

    let skip = parseInt(page as string) - 1 || 0;
    const take = parseInt(size as string) || 10;
    const order =
      (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";
    if (skip < 0) skip = 0;

    const whereCondition: any[] = [];

    if (search) {
      whereCondition.push({
        OR: [
          {
            employee: {
              name: { contains: search as string, mode: "insensitive" },
            },
          },
          {
            employee: {
              phone: { contains: search as string, mode: "insensitive" },
            },
          },
        ],
      });
    }

    if (month) whereCondition.push({ month: Number(month) });
    if (year) whereCondition.push({ year: Number(year) });

    const result = await prisma.salary.findMany({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
      include: {
        employee: {
          select: {
            accountType: true,
            email: true,
            mobileNumber: true,
          },
        },
        payment: {
          select: {
            accountType: true,
          },
        },
        vouchers: {
          select: {
            voucherNo: true,
            date: true,
          },
        },
      },
      skip: skip * take,
      take,
      orderBy: { createdAt: order },
    });

    const total = await prisma.salary.count({
      where: {
        branchId: Number(branchId),
        AND: whereCondition,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Salaries retrieved successfully",
      meta: {
        page,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getSalaryById = async (req: Request, res: Response) => {
  try {
    const salaryId = Number(req.params.id);

    if (!salaryId) {
      return res.status(400).json({
        success: false,
        message: "Salary ID is required",
      });
    }

    const result = await prisma.salary.findFirst({
      where: { id: salaryId },
      include: {
        employee: {
          select: {
            accountType: true,
            email: true,
            mobileNumber: true,
          },
        },

        payment: {
          select: {
            id: true,
            accountType: true,
          },
        },
        vouchers: {
          include: {
            particulars: {
              include: {
                particular: {
                  include: {
                    ledger: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Salary not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Salary retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await prisma.$transaction(async (tx) => {
    try {
      const { branchId, type, date, narration, entries } = req.body;
      const voucherDate = date ? new Date(date) : new Date();

      // 1️⃣ Debit & Credit check
      const totalDebit = entries
        .filter((e: any) => e.type === "Debit")
        .reduce((acc: number, e: any) => acc + e.amount, 0);
      const totalCredit = entries
        .filter((e: any) => e.type === "Credit")
        .reduce((acc: number, e: any) => acc + e.amount, 0);
      if (Math.abs(totalDebit - totalCredit) > 0.0001) {
        throw new Error(
          `Debit (${totalDebit}) and Credit (${totalCredit}) mismatch`,
        );
      }

      const lastVoucher = await tx.voucher.findFirst({
        where: { branchId },
        orderBy: { id: "desc" },
      });
      const voucherNo = `VCH-${branchId}-${(lastVoucher?.id || 0) + 1}`;
      // 2️⃣ Create voucher
      const voucher = await tx.voucher.create({
        data: {
          branchId,
          type,
          date: voucherDate,
          narration,
          voucherNo,
        },
      });

      // 3️⃣ Load particulars with ledger & group
      const particularIds = entries.map((e: any) => e.particularId);

      const particulars = await tx.particular.findMany({
        where: { id: { in: particularIds } },
        include: { ledger: { include: { group: true } } },
      });

      for (const p of particulars) {
        if (p.branchId !== branchId) {
          throw new Error(`Particular ${p.id} belongs to another branch`);
        }
      }

      // 4️⃣ Loop entries
      for (const entry of entries) {
        const particular = particulars.find((p) => p.id === entry.particularId);
        if (!particular)
          throw new Error(`Particular not found for ID ${entry.particularId}`);

        const ledger = particular.ledger;
        if (!ledger)
          throw new Error(
            `Ledger not found for Particular ID ${entry.particularId}`,
          );
        if (!ledger.isActive)
          throw new Error(`Ledger ${ledger.id} is inactive`);
        const accountType = ledger.group.account;

        // Create particularOnVoucher entry
        await tx.particularOnVoucher.create({
          data: {
            voucherId: voucher.id,
            particularId: particular.id,
            type: entry.type,
            amount: entry.amount,
          },
        });

        let newLedgerBalance = ledger.balance;
        let newParticularBalance = particular.balance;

        switch (accountType) {
          case "Assets":
          case "Expense":
            newLedgerBalance =
              entry.type === "Debit"
                ? ledger.balance + entry.amount
                : ledger.balance - entry.amount;

            newParticularBalance =
              entry.type === "Debit"
                ? particular.balance + entry.amount
                : particular.balance - entry.amount;
            break;

          case "Liability":
          case "Equity":
          case "Income":
          case "Other_Accounts":
            newLedgerBalance =
              entry.type === "Debit"
                ? ledger.balance - entry.amount
                : ledger.balance + entry.amount;

            newParticularBalance =
              entry.type === "Debit"
                ? particular.balance - entry.amount
                : particular.balance + entry.amount;
            break;
        }

        await tx.ledger.update({
          where: { id: ledger.id },
          data: { balance: newLedgerBalance },
        });
        await tx.particular.update({
          where: { id: particular.id },
          data: { balance: newParticularBalance },
        });

        // Update in-memory for next loop
        ledger.balance = newLedgerBalance;
        particular.balance = newParticularBalance;
      }
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId,
          ip: req.ip,
          userId: req.user?.id,
          action: "CREATE",
          description: `Voucher ${voucher.voucherNo} created with ${entries.length} entries.`,
          data: {
            type,
            narration,
            entries,
          },
        },
      });
      return voucher;
    } catch (error) {
      throw error;
    }
  });

  return res.status(201).json({
    success: true,
    message: "Voucher created successfully",
    data: session,
  });
};

export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const { page = 1, size = 10, branchId, search, type } = req.query;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "branchId is required",
      });
    }

    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    const whereCondition: any = {
      branchId: Number(branchId),
    };

    if (type) whereCondition.type = type;
    if (search) {
      whereCondition.OR = [
        { narration: { contains: String(search) } },
        { voucherNo: { contains: String(search) } }, // ← এটা যোগ করো
      ];
    }

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where: whereCondition,
        include: {
          particulars: {
            include: {
              particular: {
                include: {
                  ledger: {
                    include: { group: true },
                  },
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { id: "desc" },
      }),
      prisma.voucher.count({ where: whereCondition }),
    ]);

    res.status(200).json({
      success: true,
      message: "Vouchers fetched successfully",
      meta: {
        total,
        page: Number(page),
        size: Number(size),
        totalPage: Math.ceil(total / Number(size)),
      },
      data: vouchers,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vouchers",
      error: error.message,
    });
  }
};

/**
 * 🧾 Get Voucher by ID
 */
export const getVoucherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({
      where: { id: Number(id) },
      include: {
        particulars: {
          include: {
            particular: {
              include: {
                ledger: {
                  include: { group: true },
                },
              },
            },
          },
        },
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher fetched successfully",
      data: voucher,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch voucher",
      error: error.message,
    });
  }
};

/**
 * ✏️ Update Voucher
 * Will also re-calculate ledger balances based on changes
 */
export const updateVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const session = await prisma.$transaction(async (tx) => {
    try {
      const { branchId, type, date, narration, entries } = req.body;
      const voucherDate = date ? new Date(date) : new Date();

      // 🔍 1️⃣ Voucher check
      const existingVoucher = await tx.voucher.findUnique({
        where: { id: Number(id) },
        include: {
          particulars: {
            include: {
              particular: { include: { ledger: { include: { group: true } } } },
            },
          },
        },
      });

      if (!existingVoucher) {
        throw new Error(`Voucher not found with ID ${id}`);
      }

      if (existingVoucher.branchId !== branchId) {
        throw new Error(`Voucher does not belong to branch ${branchId}`);
      }

      // 🧮 2️⃣ Debit & Credit check
      const totalDebit = entries
        .filter((e: any) => e.type === "Debit")
        .reduce((acc: number, e: any) => acc + e.amount, 0);
      const totalCredit = entries
        .filter((e: any) => e.type === "Credit")
        .reduce((acc: number, e: any) => acc + e.amount, 0);
      if (Math.abs(totalDebit - totalCredit) > 0.0001) {
        throw new Error(
          `Debit (${totalDebit}) and Credit (${totalCredit}) mismatch`,
        );
      }

      // 🔁 3️⃣ Rollback old balances before updating
      for (const oldEntry of existingVoucher.particulars) {
        const ledger = oldEntry.particular.ledger;
        const accountType = ledger.group.account;

        let rollbackLedgerBalance = ledger.balance;
        let rollbackParticularBalance = oldEntry.particular.balance;

        switch (accountType) {
          case "Assets":
          case "Expense":
            rollbackLedgerBalance =
              oldEntry.type === "Debit"
                ? ledger.balance - oldEntry.amount
                : ledger.balance + oldEntry.amount;
            rollbackParticularBalance =
              oldEntry.type === "Debit"
                ? oldEntry.particular.balance - oldEntry.amount
                : oldEntry.particular.balance + oldEntry.amount;
            break;

          case "Liability":
          case "Equity":
          case "Income":
          case "Other_Accounts":
            rollbackLedgerBalance =
              oldEntry.type === "Debit"
                ? ledger.balance + oldEntry.amount
                : ledger.balance - oldEntry.amount;
            rollbackParticularBalance =
              oldEntry.type === "Debit"
                ? oldEntry.particular.balance + oldEntry.amount
                : oldEntry.particular.balance - oldEntry.amount;
            break;
        }

        await tx.ledger.update({
          where: { id: ledger.id },
          data: { balance: rollbackLedgerBalance },
        });

        await tx.particular.update({
          where: { id: oldEntry.particular.id },
          data: { balance: rollbackParticularBalance },
        });
      }

      // 🧹 4️⃣ Delete old entries
      await tx.particularOnVoucher.deleteMany({
        where: { voucherId: existingVoucher.id },
      });

      // ✏️ 5️⃣ Update voucher main info
      const updatedVoucher = await tx.voucher.update({
        where: { id: existingVoucher.id },
        data: {
          branchId,
          type,
          date: voucherDate,
          narration,
        },
      });

      // 🧾 6️⃣ Load new particulars
      const particularIds = entries.map((e: any) => e.particularId);
      const particulars = await tx.particular.findMany({
        where: { id: { in: particularIds } },
        include: { ledger: { include: { group: true } } },
      });

      // 🔁 7️⃣ Insert new entries and update balances
      for (const entry of entries) {
        const particular = particulars.find((p) => p.id === entry.particularId);
        if (!particular)
          throw new Error(`Particular not found for ID ${entry.particularId}`);
        const ledger = particular.ledger;
        if (!ledger.isActive)
          throw new Error(`Ledger ${ledger.id} is inactive`);

        const accountType = ledger.group.account;

        await tx.particularOnVoucher.create({
          data: {
            voucherId: updatedVoucher.id,
            particularId: particular.id,
            type: entry.type,
            amount: entry.amount,
          },
        });

        let newLedgerBalance = ledger.balance;
        let newParticularBalance = particular.balance;

        switch (accountType) {
          case "Assets":
          case "Expense":
            newLedgerBalance =
              entry.type === "Debit"
                ? ledger.balance + entry.amount
                : ledger.balance - entry.amount;
            newParticularBalance =
              entry.type === "Debit"
                ? particular.balance + entry.amount
                : particular.balance - entry.amount;
            break;

          case "Liability":
          case "Equity":
          case "Income":
          case "Other_Accounts":
            newLedgerBalance =
              entry.type === "Debit"
                ? ledger.balance - entry.amount
                : ledger.balance + entry.amount;
            newParticularBalance =
              entry.type === "Debit"
                ? particular.balance - entry.amount
                : particular.balance + entry.amount;
            break;
        }

        await tx.ledger.update({
          where: { id: ledger.id },
          data: { balance: newLedgerBalance },
        });
        await tx.particular.update({
          where: { id: particular.id },
          data: { balance: newParticularBalance },
        });

        ledger.balance = newLedgerBalance;
        particular.balance = newParticularBalance;
      }

      // 🧠 8️⃣ Audit log
      await tx.voucherAudit.create({
        data: {
          voucherId: updatedVoucher.id,
          branchId,
          ip: req.ip,
          userId: req.user?.id || null,
          action: "UPDATE",
          description: `Voucher ${updatedVoucher.voucherNo} updated with ${entries.length} entries.`,
          data: {
            type,
            narration,
            entries,
          },
        },
      });

      return updatedVoucher;
    } catch (error) {
      throw error;
    }
  });

  return res.status(200).json({
    success: true,
    message: "Voucher updated successfully",
    data: session,
  });
};

export const deleteVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const session = await prisma.$transaction(async (tx) => {
    try {
      // 🔍 1️⃣ Find voucher
      const voucher = await tx.voucher.findUnique({
        where: { id: Number(id) },
        include: {
          particulars: {
            include: {
              particular: { include: { ledger: { include: { group: true } } } },
            },
          },
        },
      });

      if (!voucher) {
        throw new Error(`Voucher not found with ID ${id}`);
      }

      // 🔁 2️⃣ Rollback balances
      for (const entry of voucher.particulars) {
        const ledger = entry.particular.ledger;
        const accountType = ledger.group.account;

        let rollbackLedgerBalance = ledger.balance;
        let rollbackParticularBalance = entry.particular.balance;

        switch (accountType) {
          case "Assets":
          case "Expense":
            rollbackLedgerBalance =
              entry.type === "Debit"
                ? ledger.balance - entry.amount
                : ledger.balance + entry.amount;
            rollbackParticularBalance =
              entry.type === "Debit"
                ? entry.particular.balance - entry.amount
                : entry.particular.balance + entry.amount;
            break;

          case "Liability":
          case "Equity":
          case "Income":
          case "Other_Accounts":
            rollbackLedgerBalance =
              entry.type === "Debit"
                ? ledger.balance + entry.amount
                : ledger.balance - entry.amount;
            rollbackParticularBalance =
              entry.type === "Debit"
                ? entry.particular.balance + entry.amount
                : entry.particular.balance - entry.amount;
            break;
        }

        await tx.ledger.update({
          where: { id: ledger.id },
          data: { balance: rollbackLedgerBalance },
        });

        await tx.particular.update({
          where: { id: entry.particular.id },
          data: { balance: rollbackParticularBalance },
        });
      }

      // 🧹 3️⃣ Delete voucher entries
      await tx.particularOnVoucher.deleteMany({
        where: { voucherId: voucher.id },
      });

      // 🗑 4️⃣ Delete the voucher
      await tx.voucher.delete({
        where: { id: voucher.id },
      });

      // 🧠 5️⃣ Audit log
      await tx.voucherAudit.create({
        data: {
          voucherId: voucher.id,
          branchId: voucher.branchId,
          ip: req.ip,
          userId: req.user?.id || null,
          action: "DELETE",
          description: `Voucher ${voucher.voucherNo} deleted.`,
          data: {
            type: voucher.type,
            narration: voucher.narration,
            entries: voucher.particulars.map((e) => ({
              particularId: e.particularId,
              type: e.type,
              amount: e.amount,
            })),
          },
        },
      });

      return { id: voucher.id, voucherNo: voucher.voucherNo };
    } catch (error) {
      throw error;
    }
  });

  return res.status(200).json({
    success: true,
    message: "Voucher deleted successfully",
    data: session,
  });
};

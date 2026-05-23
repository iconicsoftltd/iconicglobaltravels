import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";

export const createServiceSale = async (req: Request, res: Response, next: NextFunction) => {
    const {
        branchId,
        date,
        invoiceNo,
        customerId,
        paymentAccountId,
        totalPaymentAmount,
        vat = 0,
        discount = 0,
        tc = 0,
        products,
    } = req.body;

    try {
        const { id } = req.user;
        const result = await prisma.$transaction(async (tx) => {
            const saleDate = new Date(date);

            // 🧾 1️⃣ Create Sale record
            const totalAmount = products.reduce((sum: any, p: any) => sum + p.unitPrice * p.quantity, 0);
            const finalTotalAmount = (totalAmount + vat + tc) - discount;
            const dueAmount = finalTotalAmount - totalPaymentAmount;

            const sale = await tx.serviceSale.create({
                data: {
                    branchId,
                    date: saleDate,
                    invoiceNo,
                    customerId,
                    paymentAccountId,
                    totalAmount: finalTotalAmount,
                    totalPaymentAmount,
                    dueAmount,
                    vat,
                    tc,
                    discount,
                },
            });

            // 🧮 2️⃣ Insert SaleProduct + Update Stock (Decrease)
            for (const p of products) {
                const productVar = await tx.service.findUnique({
                    where: { id: p.serviceId },
                });

                if (!productVar) {
                    throw new Error(`Service ${p.serviceId} not found`);
                }


                await tx.serviceSaleProduct.create({
                    data: {
                        saleId: sale.id,
                        branchId,
                        serviceId: p.serviceId,
                        quantity: p.quantity,
                        unitPrice: p.unitPrice,
                        subTotal: p.unitPrice * p.quantity,
                    },
                });
            }

            // 🧾 3️⃣ Create Voucher (Type: SALES)
            const voucher = await tx.voucher.create({
                data: {
                    branchId,
                    type: "SERVICE_SALES",
                    date: saleDate,
                    serviceSaleId: sale.id,
                    voucherNo: invoiceNo,
                    narration: `Service Sale ${invoiceNo} to customer ${customerId}`,
                },
            });

            // 🔎 4️⃣ Get Customer + PaymentAccount + SalesLedger
            const customer = await tx.particular.findUnique({
                where: { id: customerId },
                include: { ledger: { include: { group: true } } },
            });
            if (!customer) throw new Error("Customer not found");

            const paymentAccount = await tx.particular.findUnique({
                where: { id: paymentAccountId },
                include: { ledger: { include: { group: true } } },
            });
            if (!paymentAccount) throw new Error("Payment account not found");
            if (customer.ledger.group.account !== "Assets" || paymentAccount.ledger.group.account !== "Assets") throw new Error("Customer and payment account must be in the Assets ledger group");
            const salesLedger = await tx.ledger.findFirst({
                where: { branchId, ledgerType: "Service" },
                include: { particulars: { take: 1 } },
            });
            if (!salesLedger || !salesLedger.particulars[0]) {
                throw new Error("Service Ledger not found");
            }

            // 🧾 5️⃣ Voucher Entries
            // a) Debit Customer (they owe you)
            await tx.particularOnVoucher.create({
                data: {
                    voucherId: voucher.id,
                    particularId: customer.id,
                    type: "Debit",
                    amount: finalTotalAmount,
                },
            });
            await tx.particular.update({
                where: { id: customer.id },
                data: { balance: { increment: finalTotalAmount } },
            });
            await tx.ledger.update({
                where: { id: customer.ledgerId },
                data: { balance: { increment: finalTotalAmount } },
            });

            // b) Credit Sales Ledger (income increases)
            await tx.particularOnVoucher.create({
                data: {
                    voucherId: voucher.id,
                    particularId: salesLedger.particulars[0].id,
                    type: "Credit",
                    amount: finalTotalAmount,
                },
            });
            await tx.particular.update({
                where: { id: salesLedger.particulars[0].id },
                data: { balance: { increment: finalTotalAmount } },
            });
            await tx.ledger.update({
                where: { id: salesLedger.id },
                data: { balance: { increment: finalTotalAmount } },
            });

            // 💰 6️⃣ Payment entry (if any)
            if (totalPaymentAmount > 0) {
                // c) Credit Customer (reduce receivable)
                await tx.particularOnVoucher.create({
                    data: {
                        voucherId: voucher.id,
                        particularId: customer.id,
                        type: "Credit",
                        amount: totalPaymentAmount,
                    },
                });
                await tx.particular.update({
                    where: { id: customer.id },
                    data: { balance: { decrement: totalPaymentAmount } },
                });
                await tx.ledger.update({
                    where: { id: customer.ledgerId },
                    data: { balance: { decrement: totalPaymentAmount } },
                });

                // d) Debit Payment Account (cash/bank increases)
                await tx.particularOnVoucher.create({
                    data: {
                        voucherId: voucher.id,
                        particularId: paymentAccount.id,
                        type: "Debit",
                        amount: totalPaymentAmount,
                    },
                });
                await tx.particular.update({
                    where: { id: paymentAccount.id },
                    data: { balance: { increment: totalPaymentAmount } },
                });
                await tx.ledger.update({
                    where: { id: paymentAccount.ledgerId },
                    data: { balance: { increment: totalPaymentAmount } },
                });
            }

            // 🧾 7️⃣ Audit Log
            await tx.voucherAudit.create({
                data: {
                    userId: req.user.id,
                    voucherId: voucher.id,
                    branchId,
                    action: "CREATE",
                    description: `Service Sales voucher created for invoice ${invoiceNo}`,
                },
            });

            await prisma.serviceSalesLog.create({
                data: {
                    branchId: sale.branchId,
                    ip: req.ip || "0.0.0.0",
                    updatedById: id,
                    serviceSalesId: sale.id,
                    data: { sale: sale, products, },
                    action: "CREATED"
                }
            })

            return { sale, voucher };
        });

        res.status(201).json({
            success: true,
            message: "Service Sale created successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};



export const updateServiceSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const saleId = Number(req.params.id);
        const {
            branchId,
            date,
            invoiceNo,
            customerId,
            paymentAccountId,
            totalPaymentAmount,
            vat = 0,
            discount = 0,
            tc = 0,
            products,
        } = req.body;

        const saleDate = new Date(date);

        const updatedSale = await prisma.$transaction(async (tx) => {
            // 1️⃣ Fetch existing sale
            const existingSale = await tx.serviceSale.findUnique({
                where: { id: saleId },
            });
            if (!existingSale) throw new Error("Service Sale not found");



            // 3️⃣ Rollback old accounting entries
            const oldEntries = await tx.particularOnVoucher.findMany({
                where: { voucher: { serviceSaleId: saleId } },
                include: { particular: { include: { ledger: { include: { group: true } } } } },
            });

            for (const entry of oldEntries) {
                const ledgerType = entry.particular.ledger?.group?.account || "Other";
                let updateData: any;

                if (entry.type === "Debit") {
                    if (["Assets", "Expense"].includes(ledgerType)) updateData = { decrement: entry.amount };
                    else updateData = { increment: entry.amount };
                } else {
                    if (["Assets", "Expense"].includes(ledgerType)) updateData = { increment: entry.amount };
                    else updateData = { decrement: entry.amount };
                }

                await tx.particular.update({ where: { id: entry.particularId }, data: { balance: updateData } });
                if (entry.particular.ledger) {
                    await tx.ledger.update({ where: { id: entry.particular.ledgerId }, data: { balance: updateData } });
                }
            }
            const voucherId = oldEntries[0]?.voucherId;
            // 4️⃣ Delete old voucher entries & SaleProduct
            await tx.particularOnVoucher.deleteMany({ where: { voucher: { serviceSaleId: saleId } } });
            await tx.serviceSaleProduct.deleteMany({ where: { saleId } });

            // 5️⃣ Update sale main record
            const totalAmountCalc = products.reduce((sum: any, p: any) => sum + p.unitPrice * p.quantity, 0);
            const finalTotalAmount = totalAmountCalc + vat + tc - discount;
            const dueAmount = finalTotalAmount - totalPaymentAmount;

            const updatedSaleRecord = await tx.serviceSale.update({
                where: { id: saleId },
                data: {
                    branchId,
                    date: saleDate,
                    invoiceNo,
                    customerId,
                    paymentAccountId,
                    totalAmount: finalTotalAmount,
                    totalPaymentAmount,
                    dueAmount,
                    vat,
                    tc,
                    discount,
                },
            });

            // 6️⃣ Insert new SaleProduct + update stock
            for (const p of products) {
                const productVar = await tx.service.findUnique({ where: { id: p.serviceId } });
                if (!productVar) throw new Error(`Service ${p.serviceId} not found`);



                await tx.serviceSaleProduct.create({
                    data: {
                        saleId,
                        branchId,
                        serviceId: p.serviceId,
                        quantity: p.quantity,
                        unitPrice: p.unitPrice,
                        subTotal: p.quantity * p.unitPrice,
                    },
                });
            }

            // 7️⃣ Update Voucher
            const voucher = await tx.voucher.update({
                where: { id: voucherId },
                data: {
                    branchId,
                    type: "SERVICE_SALES",
                    date: saleDate,
                    voucherNo: invoiceNo,
                    narration: `Service Sale ${invoiceNo} to customer ${customerId}`,
                },
            });

            // 8️⃣ Create accounting entries
            const customer = await tx.particular.findUnique({ where: { id: customerId }, include: { ledger: { include: { group: true } } } });
            if (!customer) throw new Error("Customer not found");

            const paymentAccount = await tx.particular.findUnique({ where: { id: paymentAccountId }, include: { ledger: { include: { group: true } } } });
            if (!paymentAccount) throw new Error("Payment account not found");
            if (customer.ledger.group.account !== "Assets" || paymentAccount.ledger.group.account !== "Assets") throw new Error("Customer and payment account must be in the Assets ledger group");
            const salesLedger = await tx.ledger.findFirst({ where: { branchId, ledgerType: "Service" }, include: { particulars: { take: 1 } } });
            if (!salesLedger || !salesLedger.particulars[0]) throw new Error("Sales ledger not found");

            // a) Debit Customer
            await tx.particularOnVoucher.create({
                data: { voucherId: voucher.id, particularId: customer.id, type: "Debit", amount: finalTotalAmount },
            });
            await tx.particular.update({ where: { id: customer.id }, data: { balance: { increment: finalTotalAmount } } });
            await tx.ledger.update({ where: { id: customer.ledgerId }, data: { balance: { increment: finalTotalAmount } } });

            // b) Credit Sales Ledger
            await tx.particularOnVoucher.create({
                data: { voucherId: voucher.id, particularId: salesLedger.particulars[0].id, type: "Credit", amount: finalTotalAmount },
            });
            await tx.particular.update({ where: { id: salesLedger.particulars[0].id }, data: { balance: { increment: finalTotalAmount } } });
            await tx.ledger.update({ where: { id: salesLedger.id }, data: { balance: { increment: finalTotalAmount } } });

            // c) Payment (if any)
            if (totalPaymentAmount > 0) {
                // Debit Payment Account
                await tx.particularOnVoucher.create({ data: { voucherId: voucher.id, particularId: paymentAccount.id, type: "Debit", amount: totalPaymentAmount } });
                await tx.particular.update({ where: { id: paymentAccount.id }, data: { balance: { increment: totalPaymentAmount } } });
                await tx.ledger.update({ where: { id: paymentAccount.ledgerId }, data: { balance: { increment: totalPaymentAmount } } });

                // Credit Customer
                await tx.particularOnVoucher.create({ data: { voucherId: voucher.id, particularId: customer.id, type: "Credit", amount: totalPaymentAmount } });
                await tx.particular.update({ where: { id: customer.id }, data: { balance: { decrement: totalPaymentAmount } } });
                await tx.ledger.update({ where: { id: customer.ledgerId }, data: { balance: { decrement: totalPaymentAmount } } });
            }

            // 9️⃣ Audit log
            await tx.voucherAudit.create({
                data: {
                    voucherId: voucher.id,
                    branchId,
                    userId: req.user?.id || null,
                    action: "UPDATE",
                    description: `Service Sale updated for invoice ${invoiceNo}`,
                    data: { sale: updatedSaleRecord, products },
                },
            });

            await prisma.serviceSalesLog.create({
                data: {
                    branchId: updatedSaleRecord.branchId,
                    ip: req.ip || "0.0.0.0",
                    updatedById: id,
                    serviceSalesId: updatedSaleRecord.id,
                    data: { sale: updatedSaleRecord, products },
                    action: "UPDATED",
                }
            })

            return updatedSaleRecord;
        });

        return res.status(200).json({ success: true, message: "Service Sale updated successfully", data: updatedSale });

    } catch (error: any) {
        next(error);
    }
};


export const deleteServiceSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const saleId = Number(req.params.id);


        const deleteSale = await prisma.$transaction(async (tx) => {
            // 1️⃣ Fetch existing sale
            const existingSale = await tx.serviceSale.findUnique({
                where: { id: saleId },
                include: { serviceSaleProducts: true, },
            });
            if (!existingSale) throw new Error("Service Sale not found");



            // 3️⃣ Rollback old accounting entries
            const oldEntries = await tx.particularOnVoucher.findMany({
                where: { voucher: { serviceSaleId: saleId } },
                include: { particular: { include: { ledger: { include: { group: true } } } } },
            });

            for (const entry of oldEntries) {
                const ledgerType = entry.particular.ledger?.group?.account || "Other";
                let updateData: any;

                if (entry.type === "Debit") {
                    if (["Assets", "Expense"].includes(ledgerType)) updateData = { decrement: entry.amount };
                    else updateData = { increment: entry.amount };
                } else {
                    if (["Assets", "Expense"].includes(ledgerType)) updateData = { increment: entry.amount };
                    else updateData = { decrement: entry.amount };
                }

                await tx.particular.update({ where: { id: entry.particularId }, data: { balance: updateData } });
                if (entry.particular.ledger) {
                    await tx.ledger.update({ where: { id: entry.particular.ledgerId }, data: { balance: updateData } });
                }
            }
            const voucherId = oldEntries[0]?.voucherId;
            // 4️⃣ Delete old voucher entries & SaleProduct
            await tx.particularOnVoucher.deleteMany({ where: { voucher: { serviceSaleId: saleId } } });
            await tx.serviceSaleProduct.deleteMany({ where: { saleId } });


            await tx.serviceSale.delete({ where: { id: saleId } });

            // 5️⃣ Delete voucher
            await tx.voucher.delete({ where: { id: voucherId } });




            // 9️⃣ Audit log
            await tx.voucherAudit.create({
                data: {
                    voucherId: voucherId,
                    branchId: existingSale.branchId,
                    userId: req.user?.id || null,
                    action: "DELETE",
                    description: `Service Sale Delete for invoice ${existingSale.invoiceNo}`,
                    data: { sale: existingSale },
                },
            });

            await prisma.serviceSalesLog.create({
                data: {
                    branchId: existingSale.branchId,
                    ip: req.ip || "0.0.0.0",
                    updatedById: id,
                    serviceSalesId: existingSale.id,
                    data: { sale: existingSale, products: existingSale.serviceSaleProducts },
                    action: "DELETED",
                }
            })

        });

        return res.status(200).json({
            success: true,
            message: "Service Sale Deleted successfully",
        });

    } catch (error: any) {
        next(error);
    }
};

export const getServiceSalesAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, size, sortOrder, search, branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ success: false, message: "Branch id is required" });
        }

        let skip = parseInt(page as string) - 1 || 0;
        const take = parseInt(size as string) || 10;
        const order = (sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";
        if (skip < 0) skip = 0;

        const whereCondition: Prisma.ServiceSaleWhereInput[] = [];
        if (search) {
            whereCondition.push({
                OR: [
                    { invoiceNo: { contains: search as string } },
                    { customer: { accountType: { contains: search as string, } } },
                ],
            });
        }

        const result = await prisma.serviceSale.findMany({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
            include: {
                customer: {
                    select: {
                        accountType: true,
                    }
                }
            },
            skip: skip * take,
            take,
            orderBy: { date: order },
        });

        const total = await prisma.serviceSale.count({
            where: {
                branchId: Number(branchId),
                AND: whereCondition,
            },
        });

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Service Sales retrieved successfully",
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

// ✅ Get purchase by ID
export const getServiceSalesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const purchaseId = Number(req.params.id);
        if (!purchaseId) {
            return res.status(400).json({
                success: false,
                message: "Sales ID is missing in the request parameters",
            });
        }

        const result = await prisma.serviceSale.findFirst({
            where: { id: purchaseId },
            include: {
                serviceSaleProducts: {
                    include: {
                        service: true
                    }
                },
                customer: true,
                account: true,

            },
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Service Sales not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Service Sales retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};



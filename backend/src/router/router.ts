import { Router } from "express";
import permissionRouter from "../module/permission/permission.index";
import uploadRouter from "../module/fileUpload";
import departmentRouter from "../module/department/department.index";
import designationRouter from "../module/designation.ts/designation.index";
import roleRouter from "../module/role/role.index";
import employeeRouter from "../module/employee/employee.index";
import userRouter from "../module/user/user.index";
import userPermissionRouter from "../module/userPermission/userPermission.index";
import branchRouter from "../module/branch/branch.index";
import userBranchRouter from "../module/userBranch/userBranch.index";
import groupRouter from "../module/group/group.index";
import ledgerRouter from "../module/ledger/ledger.index";
import particularRouter from "../module/particular/particular.index";
import voucherRouter from "../module/voucher/voucher.index";
import reportRouter from "../module/report/router.index";
import categoryRouter from "../module/category/category.index";
import subcategory from "../module/subCategory/subCategory.index";
import brandRouter from "../module/brand/brand.index";
import unitRouter from "../module/unit/unit.index";
import productRouter from "../module/product/product.index";
import sizeRouter from "../module/size/size.index";
import colorRouter from "../module/color/color.index";
import productVariationRouter from "../module/productVariation/productVariation.index";
import purchaseRouter from "../module/purchase/purchase.index";
import salesRouter from "../module/sales/sales.index";
import purchaseReturnRouter from "../module/purchaseReturn/purchaseReturn.index";
import salesReturnRouter from "../module/salesReturn/salesReturn.index";
import serviceRouter from "../module/service/service.index";
import serviceSalesRouter from "../module/serviceSale/serviceSale.index";
import quotationRouter from "../module/quotation/quotation.index";
import bankRouter from "../module/bank/bank.index";
import chequeRouter from "../module/cheque/cheque.index";
import salaryStructureRouter from "../module/salaryStructure/salaryStructure.index";
import leaveDaySetupRouter from "../module/leaveDaySetup/leaveDaySetup.index";
import leaveApplyRouter from "../module/leaveApply/leaveApply.index";
import auditLogRouter from "../module/activityLog/activityLog.index";
import employeeSalaryRouter from "../module/employeeSalary/employeeSalary.index";
import test from "node:test";
import testRouter from "../module/test/test.index";


const router = Router();

router.use('/file', uploadRouter);
router.use("/permission", permissionRouter)
router.use("/department", departmentRouter)
router.use("/designation", designationRouter)
router.use("/role", roleRouter)
router.use("/employee", employeeRouter)
router.use("/branch", branchRouter)
router.use("/user", userRouter)
router.use("/test", testRouter)
router.use("/user-permission", userPermissionRouter)
router.use("/branch-assign", userBranchRouter)
router.use("/group", groupRouter)
router.use("/ledger", ledgerRouter)
router.use("/particular", particularRouter)
router.use("/voucher", voucherRouter)
router.use("/report", reportRouter)
router.use("/category", categoryRouter)
router.use("/subcategory", subcategory)
router.use("/brand", brandRouter)
router.use("/unit", unitRouter)
router.use("/product", productRouter)
router.use("/size", sizeRouter)
router.use("/color", colorRouter)
router.use("/product-variation", productVariationRouter)
router.use("/purchase", purchaseRouter)
router.use("/purchase-return", purchaseReturnRouter)
router.use("/sales", salesRouter)
router.use("/sales-return", salesReturnRouter)
router.use("/service", serviceRouter)
router.use("/quotation", quotationRouter)
router.use("/bank", bankRouter)
router.use("/cheque", chequeRouter)
router.use("/service-sales", serviceSalesRouter)
router.use("/salary-structure", salaryStructureRouter)
router.use("/leave-day-setup", leaveDaySetupRouter)
router.use("/leave-apply", leaveApplyRouter)
router.use("/audit", auditLogRouter)
router.use("/employee-salary", employeeSalaryRouter)

export default router;





import { apiSlice } from "../../rootApi/apiSlice";

export const auditLogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ============================
    //      BRANCH LOG
    // ============================
    getBranchLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-branch-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getBranchLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return ({
          url: `/audit/get-branch-log/${id}?branchId=${branchId}`,
          method: "GET",
        })
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      DEPARTMENT LOG
    // ============================
    getDepartmentLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-department-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getDepartmentLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-department-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      DESIGNATION LOG
    // ============================
    getDesignationLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-designation-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getDesignationLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-designation-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      VOUCHER LOG
    // ============================
    getVoucherLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-voucher-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getVoucherLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-voucher-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      CHEQUE LOG
    // ============================
    getChequeLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-cheque-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getChequeLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-cheque-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      EMPLOYEE LOG
    // ============================
    getEmployeeLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-employee-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getEmployeeLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-employee-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      ROLE LOG
    // ============================
    getRoleLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-role-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getRoleLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-role-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      USER LOG
    // ============================
    getUserLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-user-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getUserLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-user-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      BRANCH ASSIGN LOG
    // ============================
    getBranchAssignLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-branch-assign-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getBranchAssignLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-branch-assign-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      BANK LOG
    // ============================
    getBankLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-bank-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getBankLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-bank-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      CATEGORY LOG
    // ============================
    getCategoryLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-category-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getCategoryLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-category-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SUBCATEGORY LOG
    // ============================
    getSubCategoryLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-subcategory-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getSubCategoryLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-subcategory-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      UNIT LOG
    // ============================
    getUnitLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-unit-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getUnitLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-unit-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      BRAND LOG
    // ============================
    getBrandLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-brand-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getBrandLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-brand-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      PRODUCT LOG
    // ============================
    getProductLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-product-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getProductLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-product-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SIZE LOG
    // ============================
    getSizeLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-size-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getSizeLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-size-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      COLOR LOG
    // ============================
    getColorLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-color-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getColorLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-color-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      PRODUCT VARIATION LOG
    // ============================
    getProductVariationLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-product-variation-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getProductVariationLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-product-variation-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      PURCHASE LOG
    // ============================
    getPurchaseLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-purchase-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getPurchaseLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-purchase-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      PURCHASE RETURN LOG
    // ============================
    getPurchaseReturnLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-purchase-return-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getPurchaseReturnLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-purchase-return-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SALES LOG
    // ============================
    getSalesLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-sales-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getSalesLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-sales-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SALES RETURN LOG
    // ============================
    getSalesReturnLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-sales-return-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getSalesReturnLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-sales-return-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      QUOTATION LOG
    // ============================
    getQuotationLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-quotation-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getQuotationLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-quotation-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SERVICE LOG
    // ============================
    getServiceLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-service-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getServiceLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-service-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SERVICE SALES LOG
    // ============================
    getServiceSalesLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-service-sales-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getServiceSalesLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-service-sales-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      LEAVE APPLY LOG
    // ============================
    getLeaveApplyLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-leave-apply-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getLeaveApplyLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-leave-apply-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      LEAVE DAY SETUP LOG
    // ============================
    getLeaveDaySetupLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-leave-day-setup-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getLeaveDaySetupLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-leave-day-setup-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SALARY STRUCTURE LOG
    // ============================
    getSalaryStructureLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-salary-structure-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getSalaryStructureLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-salary-structure-log/${id}?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),

    // ============================
    //      SALARY LOG
    // ============================
    getSalaryLogAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/audit/get-salary-log?page=${page}&size=${size}&search=${search}&branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["auditLog"],
    }),
    getSalaryLogById: builder.query({
      query: (id) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return ({
          url: `/audit/get-salary-log/${id}?branchId=${branchId}`,
          method: "GET",
        });
      },
      providesTags: ["auditLog"],
    }),
  }),
});

export const {
  useGetBranchLogAllQuery,
  useGetBranchLogByIdQuery,

  useGetDepartmentLogAllQuery,
  useGetDepartmentLogByIdQuery,

  useGetDesignationLogAllQuery,
  useGetDesignationLogByIdQuery,

  useGetVoucherLogAllQuery,
  useGetVoucherLogByIdQuery,

  useGetChequeLogAllQuery,
  useGetChequeLogByIdQuery,

  useGetEmployeeLogAllQuery,
  useGetEmployeeLogByIdQuery,

  useGetRoleLogAllQuery,
  useGetRoleLogByIdQuery,

  useGetUserLogAllQuery,
  useGetUserLogByIdQuery,

  useGetBranchAssignLogAllQuery,
  useGetBranchAssignLogByIdQuery,

  useGetBankLogAllQuery,
  useGetBankLogByIdQuery,

  useGetCategoryLogAllQuery,
  useGetCategoryLogByIdQuery,

  useGetSubCategoryLogAllQuery,
  useGetSubCategoryLogByIdQuery,

  useGetUnitLogAllQuery,
  useGetUnitLogByIdQuery,

  useGetBrandLogAllQuery,
  useGetBrandLogByIdQuery,

  useGetProductLogAllQuery,
  useGetProductLogByIdQuery,

  useGetSizeLogAllQuery,
  useGetSizeLogByIdQuery,

  useGetColorLogAllQuery,
  useGetColorLogByIdQuery,

  useGetProductVariationLogAllQuery,
  useGetProductVariationLogByIdQuery,

  useGetPurchaseLogAllQuery,
  useGetPurchaseLogByIdQuery,

  useGetPurchaseReturnLogAllQuery,
  useGetPurchaseReturnLogByIdQuery,

  useGetSalesLogAllQuery,
  useGetSalesLogByIdQuery,

  useGetSalesReturnLogAllQuery,
  useGetSalesReturnLogByIdQuery,

  useGetQuotationLogAllQuery,
  useGetQuotationLogByIdQuery,

  useGetServiceLogAllQuery,
  useGetServiceLogByIdQuery,

  useGetServiceSalesLogAllQuery,
  useGetServiceSalesLogByIdQuery,

  useGetLeaveApplyLogAllQuery,
  useGetLeaveApplyLogByIdQuery,

  useGetLeaveDaySetupLogAllQuery,
  useGetLeaveDaySetupLogByIdQuery,

  useGetSalaryStructureLogAllQuery,
  useGetSalaryStructureLogByIdQuery,

  useGetSalaryLogAllQuery,
  useGetSalaryLogByIdQuery,
} = auditLogApi;

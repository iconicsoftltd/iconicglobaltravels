import { apiSlice } from "../../rootApi/apiSlice";

export const accountingReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // VOUCHER LEDGER
    getVoucherLedger: builder.query({
      query: ({ fromDate = "", toDate = "", particularId = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (particularId) params.append("particularId", particularId);

        return {
          url: `/report/voucher-ledger?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["VoucherLedger"],
    }),

    // GENERAL LEDGER
    getGeneralLedger: builder.query({
      query: ({ fromDate = "", toDate = "", particularId = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (particularId) params.append("particularId", particularId);

        return {
          url: `/report/general-ledger?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["GeneralLedger"],
    }),

    // TRIAL BALANCE - for ledger report page
    getTrialBalance: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/trial-balance?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TrialBalance"],
    }),

    // TRIAL BALANCE
    fetchTrialBalance: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/cash-flow?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TrialBalance"],
    }),

    // Stock and Inventory Report
    getStockReport: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/stock-information?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["StockReport"],
    }),

    // PROFIT & LOSS
    getProfitAndLoss: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/profit-and-loss?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ProfitAndLoss"],
    }),

    // SALES REPORT
    getSalesSummaryReport: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/sales-summary?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["sales"],
    }),

    // Purchase REPORT
    getPurchaseSummaryReport: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/purchase-summary?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["purchase"],
    }),

    // Cash In Hand REPORT
    getCashInHandReport: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/cash-in-hand?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["cashInHand"],
    }),

    // Cash In Hand REPORT
    getLedgerReport: builder.query({
      query: ({ fromDate = "", toDate = "", particularId }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        if (particularId) params.append("particularId", particularId);
       // if (particularName) params.append("particularName", particularName);

        return {
          url: `/report/ledger?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ledger"],
    }),

  }),
});

export const {
  useGetVoucherLedgerQuery,
  useGetGeneralLedgerQuery,
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetSalesSummaryReportQuery,
  useGetPurchaseSummaryReportQuery,
  useGetCashInHandReportQuery,
  useFetchTrialBalanceQuery,
  useGetStockReportQuery,
  useGetLedgerReportQuery,
} = accountingReportApi;

import { apiSlice } from "../../rootApi/apiSlice";

export const balanceSheetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET INCOME STATEMENT
    getBalanceSheet: builder.query({
      query: ({fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/balance-sheet?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BalanceSheet"],
    }),

  }),
});

export const { useGetBalanceSheetQuery } = balanceSheetApi;

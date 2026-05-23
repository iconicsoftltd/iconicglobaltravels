import { apiSlice } from "../../rootApi/apiSlice";

export const incomeStatementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET INCOME STATEMENT
    getIncomeStatement: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/income-statement?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["incomeStatement"],
    }),
  }),
});

export const { useGetIncomeStatementQuery } = incomeStatementApi;

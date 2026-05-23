import { apiSlice } from "../../rootApi/apiSlice";

export const chartOfAccountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET BALANCE SHEET
    getChartOfAccounts: builder.query({
      query: () => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = "";
        if (branchId) {
          queryParams = `?branchId=${branchId}`;
        }
        return {
          url: `/report/chart-of-accounts${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["chartOfAccounts"],
    }),
  }),
});

// Export hooks
export const {
  useGetChartOfAccountsQuery,
} = chartOfAccountsApi;
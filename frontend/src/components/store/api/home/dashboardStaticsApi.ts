import { apiSlice } from "../../rootApi/apiSlice";

export const dashboardStatics = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET DASHBOARD STATICS
    getdashboardStatics: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        console.log("Branch ID in API call:", branchId);

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/dashboard-statics?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["dashboardStatics"],
    }),
  }),
});

export const { useGetdashboardStaticsQuery, useLazyGetdashboardStaticsQuery } = dashboardStatics;

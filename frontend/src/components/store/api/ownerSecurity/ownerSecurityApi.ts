import { apiSlice } from "../../rootApi/apiSlice";

export const ownerSecurityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET INCOME STATEMENT
    getOwnerSecurity: builder.query({
      query: ({ fromDate = "", toDate = "" }) => {
        const params = new URLSearchParams();
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        if (branchId) params.append("branchId", branchId);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        return {
          url: `/report/owner-security?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["ownerSecurity"],
    }),

  }),
});

export const { useGetOwnerSecurityQuery } = ownerSecurityApi;

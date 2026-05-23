import { apiSlice } from "@/components/store/rootApi/apiSlice";

export const salaryStructureApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET BY BRANCH
    getSalaryStructureByBranch: builder.query({
      query: () => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/salary-structure/get-salary-structure-by-branch?branchId=${branchId}`,
          method: "GET",
        };
      },
      providesTags: ["salary-structure"],
    }),

    // UPDATE
    updateSalaryStructure: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/salary-structure/update-salary-structure/${id}`,
          method: "PUT",
          body: {...data, branchId},
        };
      },
      invalidatesTags: ["salary-structure"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalaryStructureByBranchQuery,
  useUpdateSalaryStructureMutation,
} = salaryStructureApi;

import { apiSlice } from "../../rootApi/apiSlice";

export const branchAssignApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    //  CREATE BRANCH ASSIGN
    createBranchAssign: builder.mutation({
      query: (body) => ({
        url: "/branch-assign/create-branch-assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["branchAssign"],
    }),

    //  GET ALL BRANCH ASSIGNS
    getAllBranchAssigns: builder.query({
      query: ({ page = 1, size = 10, search = "", }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/branch-assign/get-branch-assign-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["branchAssign"],
    }),

    //  GET BRANCH ASSIGN BY ID
    getBranchAssignById: builder.query({
      query: (id) => ({
        url: `/branch-assign/get-branch-assign/${id}`,
        method: "GET",
      }),
      providesTags: ["branchAssign"],
    }),

    //  UPDATE BRANCH ASSIGN
    updateBranchAssign: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/branch-assign/update-branch-assign/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["branchAssign"],
    }),

    //  DELETE BRANCH ASSIGN
    deleteBranchAssign: builder.mutation({
      query: (id) => ({
        url: `/branch-assign/delete-branch-assign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["branchAssign"],
    }),
  }),
  overrideExisting: false,
});

//  Export hooks
export const {
  useCreateBranchAssignMutation,
  useGetAllBranchAssignsQuery,
  useGetBranchAssignByIdQuery,
  useUpdateBranchAssignMutation,
  useDeleteBranchAssignMutation,
} = branchAssignApi;

import { apiSlice } from "@/components/store/rootApi/apiSlice";

export const leaveApplyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE
    createLeaveApply: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/leave-apply/create-leave-apply",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["leave-apply"],
    }),

    // GET ALL
    getAllLeaveApply: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;

        return {
          url: `/leave-apply/get-leave-apply-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["leave-apply"],
    }),

    // GET BY ID
    getLeaveApplyById: builder.query({
      query: (id) => ({
        url: `/leave-apply/get-leave-apply/${id}`,
        method: "GET",
      }),
      providesTags: ["leave-apply"],
    }),

    // UPDATE
    updateLeaveApply: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/leave-apply/update-leave-apply/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["leave-apply"],
    }),

    // DELETE
    deleteLeaveApply: builder.mutation({
      query: (id) => ({
        url: `/leave-apply/delete-leave-apply/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["leave-apply"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateLeaveApplyMutation,
  useGetAllLeaveApplyQuery,
  useGetLeaveApplyByIdQuery,
  useUpdateLeaveApplyMutation,
  useDeleteLeaveApplyMutation,
} = leaveApplyApi;

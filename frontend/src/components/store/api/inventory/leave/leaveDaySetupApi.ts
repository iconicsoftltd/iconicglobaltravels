import { apiSlice } from "@/components/store/rootApi/apiSlice";

export const leaveDaySetupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE
    createLeaveDaySetup: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/leave-day-setup/create-leave-day-setup",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["leave-day-setup"],
    }),

    // GET ALL
    getAllLeaveDaySetup: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;

        return {
          url: `/leave-day-setup/get-leave-day-setup-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["leave-day-setup"],
    }),

    // GET BY ID
    getLeaveDaySetupById: builder.query({
      query: (id) => ({
        url: `/leave-day-setup/get-leave-day-setup/${id}`,
        method: "GET",
      }),
      providesTags: ["leave-day-setup"],
    }),

    // UPDATE
    updateLeaveDaySetup: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/leave-day-setup/update-leave-day-setup/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["leave-day-setup"],
    }),

    // DELETE
    deleteLeaveDaySetup: builder.mutation({
      query: (id) => ({
        url: `/leave-day-setup/delete-leave-day-setup/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["leave-day-setup"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateLeaveDaySetupMutation,
  useGetAllLeaveDaySetupQuery,
  useGetLeaveDaySetupByIdQuery,
  useUpdateLeaveDaySetupMutation,
  useDeleteLeaveDaySetupMutation,
} = leaveDaySetupApi;

import { apiSlice } from "../../rootApi/apiSlice";

export const groupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE GROUP
    createGroup: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/group/create-group",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["group"],
    }),

    // GET ALL GROUPS
    getAllGroups: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/group/get-group-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["group"],
    }),

    // GET GROUP BY ID
    getGroupById: builder.query({
      query: (id) => ({
        url: `/group/get-group/${id}`,
        method: "GET",
      }),
      providesTags: ["group"],
    }),

    // UPDATE GROUP
    updateGroup: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/group/update-group/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["group"],
    }),

    // DELETE GROUP
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/group/delete-group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["group"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateGroupMutation,
  useGetAllGroupsQuery,
  useGetGroupByIdQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupApi;

import { apiSlice } from "../../rootApi/apiSlice";

export const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE ROLE
    createRole: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/role/create-role",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["role"],
    }),

    // GET ALL ROLES
    getAllRoles: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/role/get-role-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["role"],
    }),

    // GET ROLE BY ID
    getRoleById: builder.query({
      query: (id) => ({
        url: `/role/get-role/${id}`,
        method: "GET",
      }),
      providesTags: ["role"],
    }),

    // UPDATE ROLE
    updateRole: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/role/update-role/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["role"],
    }),

    // DELETE ROLE
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/role/delete-role/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["role"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;

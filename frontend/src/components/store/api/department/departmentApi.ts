import { apiSlice } from "../../rootApi/apiSlice";

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE DEPARTMENT
    createDepartment: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/department/create-department",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["department"],
    }),

    // GET ALL DEPARTMENTS
    getAllDepartments: builder.query({
      query: ({ page = 1, size = 100, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/department/get-department-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["department"],
    }),

    // GET DEPARTMENT BY ID
    getDepartmentById: builder.query({
      query: (id) => ({
        url: `/department/get-department/${id}`,
        method: "GET",
      }),
      providesTags: ["department"],
    }),

    // UPDATE DEPARTMENT
    updateDepartment: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/department/update-department/${id}`,
          method: "PUT",
          body: { ...body, branchId },
        });
      },
      invalidatesTags: ["department"],
    }),

    // DELETE DEPARTMENT
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/department/delete-department/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["department"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateDepartmentMutation,
  useGetAllDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;

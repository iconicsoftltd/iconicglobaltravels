import { apiSlice } from "../../rootApi/apiSlice";

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE EMPLOYEE
    createEmployee: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/employee/create-employee",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["employee"],
    }),

    // GET ALL EMPLOYEES
    getAllEmployees: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/employee/get-employee-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["employee"],
    }),

    // GET EMPLOYEE BY ID
    getEmployeeById: builder.query({
      query: (id) => ({
        url: `/employee/get-employee/${id}`,
        method: "GET",
      }),
      providesTags: ["employee"],
    }),

    // UPDATE EMPLOYEE
    updateEmployee: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/employee/update-employee/${id}`,
          method: "PUT",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["employee"],
    }),

    // UPDATE EMPLOYEE STATUS
    updateEmployeeStatus: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/employee/update-employee-status/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["employee"],
    }),

    // DELETE EMPLOYEE
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employee/delete-employee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["employee"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateEmployeeMutation,
  useGetAllEmployeesQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useDeleteEmployeeMutation,
} = employeeApi;

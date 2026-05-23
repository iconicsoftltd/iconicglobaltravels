import { apiSlice } from "@/components/store/rootApi/apiSlice";

export const employeeSalaryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE SALARY
    createEmployeeSalary: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        return {
          url: "/employee-salary/create-salary",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["employeeSalary"],
    }),

    // GET ALL SALARIES
    getAllEmployeeSalaries: builder.query({
      query: ({ page = 1, size = 10, search = "", month, year }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        if (month) queryParams += `&month=${month}`;
        if (year) queryParams += `&year=${year}`;

        return {
          url: `/employee-salary/get-salary-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["employeeSalary"],
    }),

    // GET SALARY BY ID
    getEmployeeSalaryById: builder.query({
      query: (id) => ({
        url: `/employee-salary/get-salary/${id}`,
        method: "GET",
      }),
      providesTags: ["employeeSalary"],
    }),

    // UPDATE SALARY
    updateEmployeeSalary: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        return {
          url: `/employee-salary/update-salary/${id}`,
          method: "PUT",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["employeeSalary"],
    }),

    // DELETE SALARY
    deleteEmployeeSalary: builder.mutation({
      query: (id) => ({
        url: `/employee-salary/delete-salary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["employeeSalary"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateEmployeeSalaryMutation,
  useGetAllEmployeeSalariesQuery,
  useGetEmployeeSalaryByIdQuery,
  useUpdateEmployeeSalaryMutation,
  useDeleteEmployeeSalaryMutation,
} = employeeSalaryApi;

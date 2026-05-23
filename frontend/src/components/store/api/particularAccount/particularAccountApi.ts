import { apiSlice } from "../../rootApi/apiSlice";

export const particularAccountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE EMPLOYEE
    createParticular: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/particular/create-particular",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["particular"],
    }),

    // GET ALL EMPLOYEES
    getAllParticular: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/particular/get-particular-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["particular"],
    }),


    getParticularOptions: builder.query({
      query: ({ search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch
          ? JSON.parse(selectedBranch).id
          : "";

        let queryParams = "";

        if (search) {
          queryParams += `search=${encodeURIComponent(search)}&`;
        }

        if (branchId) {
          queryParams += `branchId=${branchId}`;
        }

        return {
          url: `/particular/particular-options?${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["particular"],
    }),




    getAllCustomerParticular: builder.query({
      query: ({ page = 1, size = 1000, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/particular/get-customer-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["particular"],
    }),
    getAllSupplierParticular: builder.query({
      query: ({ page = 1, size = 1000, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/particular/get-supplier-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["particular"],
    }),
    getAllAccountsParticular: builder.query({
      query: ({ page = 1, size = 1000, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/particular/get-accounts-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["particular"],
    }),
    getAllExpenseParticular: builder.query({
      query: ({ page = 1, size = 1000, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/particular/get-expense-particular-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["particular"],
    }),

    // GET EMPLOYEE BY ID
    getParticularById: builder.query({
      query: (id) => ({
        url: `/particular/get-particular/${id}`,
        method: "GET",
      }),
      providesTags: ["particular"],
    }),

    // UPDATE EMPLOYEE
    updateParticular: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return ({
          url: `/particular/update-particular/${id}`,
          method: "PUT",
          body: { ...body, branchId },
        });
      },
      invalidatesTags: ["particular"],
    }),

    // DELETE EMPLOYEE
    deleteParticular: builder.mutation({
      query: (id) => ({
        url: `/particular/delete-particular/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["particular"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateParticularMutation,
  useGetAllParticularQuery,
  useGetParticularByIdQuery,
  useDeleteParticularMutation,
  useUpdateParticularMutation,
  useGetAllCustomerParticularQuery,
  useGetAllAccountsParticularQuery,
  useGetAllSupplierParticularQuery,
  useGetAllExpenseParticularQuery,
  useGetParticularOptionsQuery
} = particularAccountApi;

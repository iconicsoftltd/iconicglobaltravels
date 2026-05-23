import { apiSlice } from "../../rootApi/apiSlice";

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE PURCHASE
    createSales: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/sales/create-sales",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["sales"],
    }),

    // GET ALL salesS
    getAllSales: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/sales/get-sales-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["sales"],
    }),

    // GET sales BY ID
    getSalesById: builder.query({
      query: (id) => ({
        url: `/sales/get-sales/${id}`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),

    // UPDATE sales
    updateSales: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/sales/update-sales/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["sales"],
    }),

    // DELETE sales
    deleteSales: builder.mutation({
      query: (id) => ({
        url: `/sales/delete-sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sales"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateSalesMutation,
  useGetAllSalesQuery,
  useGetSalesByIdQuery,
  useUpdateSalesMutation,
  useDeleteSalesMutation,
} = salesApi;

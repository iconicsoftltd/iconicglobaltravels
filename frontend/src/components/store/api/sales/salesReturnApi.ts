import { apiSlice } from "../../rootApi/apiSlice";

export const salesReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE SALES RETURN
    createSalesReturn: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/sales-return/create-sales-return",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["sales-return"],
    }),

    // GET ALL PURCHASE RETURNS
    getAllSalesReturn: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/sales-return/get-sales-return-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["sales-return"],
    }),

    // GET SALES RETURN BY ID
    getSalesReturnById: builder.query({
      query: (id) => ({
        url: `/sales-return/get-sales-return/${id}`,
        method: "GET",
      }),
      providesTags: ["sales-return"],
    }),

    // GET SALES BY INVOICE
    getSalesByInvoice: builder.query({
      query: (invoice) => ({
        url: `/sales/get-sales-invoice/${invoice}`,
        method: "GET",
      }),
      providesTags: ["sales-return", "sales"],
    }),

    // UPDATE SALES RETURN
    updateSalesReturn: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/sales-return/update-sales-return/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["sales-return"],
    }),

    // DELETE SALES RETURN
    deleteSalesReturn: builder.mutation({
      query: (id) => ({
        url: `/sales-return/delete-sales-return/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sales-return"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateSalesReturnMutation,
  useGetAllSalesReturnQuery,
  useGetSalesReturnByIdQuery,
  useGetSalesByInvoiceQuery,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
} = salesReturnApi;

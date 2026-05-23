import { apiSlice } from "../../rootApi/apiSlice";

export const purchaseReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE PURCHASE RETURN
    createPurchaseReturn: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/purchase-return/create-purchase-return",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["purchase-return"],
    }),

    // GET ALL PURCHASE RETURNS
    getAllPurchaseReturn: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/purchase-return/get-purchase-return-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["purchase-return"],
    }),

    // GET PURCHASE RETURN BY ID
    getPurchaseReturnById: builder.query({
      query: (id) => ({
        url: `/purchase-return/get-purchase-return/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase-return"],
    }),

    // GET PURCHASE BY INVOICE
    getPurchaseByInvoice: builder.query({
      query: (invoice) => ({
        url: `/purchase/get-purchase-invoice/${invoice}`,
        method: "GET",
      }),
      providesTags: ["purchase-return", "purchase"],
    }),

    // UPDATE PURCHASE RETURN
    updatePurchaseReturn: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/purchase-return/update-purchase-return/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["purchase-return"],
    }),

    // DELETE PURCHASE RETURN
    deletePurchaseReturn: builder.mutation({
      query: (id) => ({
        url: `/purchase-return/delete-purchase-return/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase-return"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreatePurchaseReturnMutation,
  useGetAllPurchaseReturnQuery,
  useGetPurchaseReturnByIdQuery,
  useGetPurchaseByInvoiceQuery,
  useUpdatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
} = purchaseReturnApi;

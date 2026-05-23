import { apiSlice } from "../../rootApi/apiSlice";

export const purchaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE PURCHASE
    createPurchase: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/purchase/create-purchase",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["purchase"],
    }),

    // GET ALL PURCHASES
    getAllPurchase: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/purchase/get-purchase-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["purchase"],
    }),

    // GET PURCHASE BY ID
    getPurchaseById: builder.query({
      query: (id) => ({
        url: `/purchase/get-purchase/${id}`,
        method: "GET",
      }),
      providesTags: ["purchase"],
    }),

    // UPDATE PURCHASE
    updatePurchase: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/purchase/update-purchase/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["purchase"],
    }),

    // DELETE PURCHASE
    deletePurchase: builder.mutation({
      query: (id) => ({
        url: `/purchase/delete-purchase/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreatePurchaseMutation,
  useGetAllPurchaseQuery,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchaseApi;

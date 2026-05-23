import { apiSlice } from "../../rootApi/apiSlice";

export const quotationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE PURCHASE
    createQuotations: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/quotation/create-quotation",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["quotation"],
    }),

    // GET ALL salesS
    getAllQuotations: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/quotation/get-quotation-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["quotation"],
    }),

    // GET sales BY ID
    getQuotationsById: builder.query({
      query: (id) => ({
        url: `/quotation/get-quotation/${id}`,
        method: "GET",
      }),
      providesTags: ["quotation"],
    }),

    // UPDATE sales
    updateQuotations: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/quotation/update-quotation/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["quotation"],
    }),

    // DELETE sales
    deleteQuotations: builder.mutation({
      query: (id) => ({
        url: `/quotation/delete-quotation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["quotation"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateQuotationsMutation,
  useGetAllQuotationsQuery,
  useGetQuotationsByIdQuery,
  useUpdateQuotationsMutation,
  useDeleteQuotationsMutation,
} = quotationApi;

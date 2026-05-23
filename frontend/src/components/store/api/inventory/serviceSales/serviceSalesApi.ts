import { apiSlice } from "@/components/store/rootApi/apiSlice";

export const serviceSalesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE PURCHASE
    createServiceSales: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/service-sales/create-service-sales",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["service-sales"],
    }),

    // GET ALL salesS
    getAllServiceSales: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/service-sales/get-service-sales-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["service-sales"],
    }),

    // GET sales BY ID
    getServiceSalesById: builder.query({
      query: (id) => ({
        url: `/service-sales/get-service-sales/${id}`,
        method: "GET",
      }),
      providesTags: ["service-sales"],
    }),

    // UPDATE sales
    updateServiceSales: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/service-sales/update-service-sales/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["service-sales"],
    }),

    // DELETE sales
    deleteServiceSales: builder.mutation({
      query: (id) => ({
        url: `/service-sales/delete-service-sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["service-sales"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateServiceSalesMutation,
  useGetAllServiceSalesQuery,
  useGetServiceSalesByIdQuery,
  useUpdateServiceSalesMutation,
  useDeleteServiceSalesMutation,
} = serviceSalesApi;

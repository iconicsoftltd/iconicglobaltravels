import { apiSlice } from "../../rootApi/apiSlice";

export const productVariationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE PRODUCT VARIATION
    createProductVariation: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/product-variation/create-product-variation",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["productVariation"],
    }),

    // GET ALL PRODUCT VARIATIONS
    getAllProductVariations: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/product-variation/get-product-variation-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["productVariation"],
    }),

    // GET PRODUCT VARIATION BY ID
    getProductVariationById: builder.query({
      query: (id) => ({
        url: `/product-variation/get-product-variation/${id}`,
        method: "GET",
      }),
      providesTags: ["productVariation"],
    }),

    // UPDATE PRODUCT VARIATION
    updateProductVariation: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/product-variation/update-product-variation/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["productVariation"],
    }),

    // DELETE PRODUCT VARIATION
    deleteProductVariation: builder.mutation({
      query: (id) => ({
        url: `/product-variation/delete-product-variation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["productVariation"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateProductVariationMutation,
  useGetAllProductVariationsQuery,
  useGetProductVariationByIdQuery,
  useUpdateProductVariationMutation,
  useDeleteProductVariationMutation,
} = productVariationApi;

import { apiSlice } from "../../rootApi/apiSlice";

export const brandApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE BRAND
    createBrand: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/brand/create-brand",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["brand"],
    }),

    // GET ALL BRANDS
    getAllBrands: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";

        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/brand/get-brand-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["brand"],
    }),

    // GET BRAND BY ID
    getBrandById: builder.query({
      query: (id) => ({
        url: `/brand/get-brand/${id}`,
        method: "GET",
      }),
      providesTags: ["brand"],
    }),

    // UPDATE BRAND
    updateBrand: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/brand/update-brand/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["brand"],
    }),

    // DELETE BRAND
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/brand/delete-brand/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["brand"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateBrandMutation,
  useGetAllBrandsQuery,
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;

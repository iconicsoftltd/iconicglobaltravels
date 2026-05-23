import { apiSlice } from "../../rootApi/apiSlice";

export const subcategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE SUBCATEGORY
    createSubcategory: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/subcategory/create-subcategory",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["subcategory"],
    }),

    // GET ALL SUBCATEGORIES
    getAllSubcategories: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/subcategory/get-subcategory-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["subcategory"],
    }),

    // GET SUBCATEGORY BY ID
    getSubcategoryById: builder.query({
      query: (id) => ({
        url: `/subcategory/get-subcategory/${id}`,
        method: "GET",
      }),
      providesTags: ["subcategory"],
    }),

    // UPDATE SUBCATEGORY
    updateSubcategory: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/subcategory/update-subcategory/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["subcategory"],
    }),

    // DELETE SUBCATEGORY
    deleteSubcategory: builder.mutation({
      query: (id) => ({
        url: `/subcategory/delete-subcategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["subcategory"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateSubcategoryMutation,
  useGetAllSubcategoriesQuery,
  useGetSubcategoryByIdQuery,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subcategoryApi;

import { apiSlice } from "../../rootApi/apiSlice";

export const sizeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE SIZE
    createSize: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/size/create-size",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["size"],
    }),

    // GET ALL SIZES
    getAllSizes: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/size/get-size-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["size"],
    }),

    // GET SIZE BY ID
    getSizeById: builder.query({
      query: (id) => ({
        url: `/size/get-size/${id}`,
        method: "GET",
      }),
      providesTags: ["size"],
    }),

    // UPDATE SIZE
    updateSize: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/size/update-size/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["size"],
    }),

    // DELETE SIZE
    deleteSize: builder.mutation({
      query: (id) => ({
        url: `/size/delete-size/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["size"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateSizeMutation,
  useGetAllSizesQuery,
  useGetSizeByIdQuery,
  useUpdateSizeMutation,
  useDeleteSizeMutation,
} = sizeApi;

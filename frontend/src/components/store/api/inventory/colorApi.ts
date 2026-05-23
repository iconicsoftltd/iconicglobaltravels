import { apiSlice } from "../../rootApi/apiSlice";

export const colorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE COLOR
    createColor: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/color/create-color",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["color"],
    }),

    // GET ALL COLORS
    getAllColors: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/color/get-color-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["color"],
    }),

    // GET COLOR BY ID
    getColorById: builder.query({
      query: (id) => ({
        url: `/color/get-color/${id}`,
        method: "GET",
      }),
      providesTags: ["color"],
    }),

    // UPDATE COLOR
    updateColor: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/color/update-color/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["color"],
    }),

    // DELETE COLOR
    deleteColor: builder.mutation({
      query: (id) => ({
        url: `/color/delete-color/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["color"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateColorMutation,
  useGetAllColorsQuery,
  useGetColorByIdQuery,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = colorApi;

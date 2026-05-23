import { apiSlice } from "../../rootApi/apiSlice";

export const designationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE DESIGNATION
    createDesignation: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/designation/create-designation",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["designation"],
    }),

    // GET ALL DESIGNATIONS
    getAllDesignations: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/designation/get-designation-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["designation"],
    }),

    // GET DESIGNATION BY ID
    getDesignationById: builder.query({
      query: (id) => ({
        url: `/designation/get-designation/${id}`,
        method: "GET",
      }),
      providesTags: ["designation"],
    }),

    // UPDATE DESIGNATION
    updateDesignation: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/designation/update-designation/${id}`,
          method: "PUT",
          body: {...body, branchId},
        };
      },
      invalidatesTags: ["designation"],
    }),

    // DELETE DESIGNATION
    deleteDesignation: builder.mutation({
      query: (id) => ({
        url: `/designation/delete-designation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["designation"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateDesignationMutation,
  useGetAllDesignationsQuery,
  useGetDesignationByIdQuery,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = designationApi;

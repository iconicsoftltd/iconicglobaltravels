import { apiSlice } from "../../rootApi/apiSlice";

export const unitApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE UNIT
    createUnit: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/unit/create-unit",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["unit"],
    }),

    // GET ALL UNITS
    getAllUnits: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/unit/get-unit-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["unit"],
    }),

    // GET UNIT BY ID
    getUnitById: builder.query({
      query: (id) => ({
        url: `/unit/get-unit/${id}`,
        method: "GET",
      }),
      providesTags: ["unit"],
    }),

    // UPDATE UNIT
    updateUnit: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/unit/update-unit/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["unit"],
    }),

    // DELETE UNIT
    deleteUnit: builder.mutation({
      query: (id) => ({
        url: `/unit/delete-unit/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["unit"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateUnitMutation,
  useGetAllUnitsQuery,
  useGetUnitByIdQuery,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitApi;

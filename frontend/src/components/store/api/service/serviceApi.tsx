import { apiSlice } from "../../rootApi/apiSlice";

export const serviceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE SERVICE
    createService: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: "/service/create-service",
          method: "POST",
          body: { ...body, branchId },
        };
      },
      invalidatesTags: ["service"],
    }),

    // GET ALL serviceS
    getAllService: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/service/get-service-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["service"],
    }),

    // GET sales BY ID
    getServiceById: builder.query({
      query: (id) => ({
        url: `/service/get-service/${id}`,
        method: "GET",
      }),
      providesTags: ["service"],
    }),

    // UPDATE sales
    updateService: builder.mutation({
      query: ({ id, ...body }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: `/service/update-service/${id}`,
          method: "PUT",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["service"],
    }),

    // DELETE sales
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/service/delete-service/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["service"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateServiceMutation,
  useGetAllServiceQuery,
  useGetServiceByIdQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;

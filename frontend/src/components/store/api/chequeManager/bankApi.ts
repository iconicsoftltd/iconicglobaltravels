import { apiSlice } from "../../rootApi/apiSlice";

export const bankApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE BANK
    createBank: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/bank/create-bank",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["bank"],
    }),

    // GET ALL BANKS
    getAllBanks: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/bank/get-bank-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["bank"],
    }),

    // GET BANK BY ID
    getBankById: builder.query({
      query: (id) => ({
        url: `/bank/get-bank/${id}`,
        method: "GET",
      }),
      providesTags: ["bank"],
    }),

    // UPDATE BANK
    updateBank: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/bank/update-bank/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["bank"],
    }),

    // DELETE BANK
    deleteBank: builder.mutation({
      query: (id) => ({
        url: `/bank/delete-bank/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["bank"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateBankMutation,
  useGetAllBanksQuery,
  useGetBankByIdQuery,
  useUpdateBankMutation,
  useDeleteBankMutation,
} = bankApi;

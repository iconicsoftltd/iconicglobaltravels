import { apiSlice } from "../../rootApi/apiSlice";

export const ledgerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE LEDGER
    createLedger: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/ledger/create-ledger",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["ledger"],
    }),

    // GET ALL LEDGERS
    getAllLedgers: builder.query({
      query: ({ page = 1, size = 500, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/ledger/get-ledger-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["ledger"],
    }),

    // GET LEDGER BY ID
    getLedgerById: builder.query({
      query: (id) => ({
        url: `/ledger/get-ledger/${id}`,
        method: "GET",
      }),
      providesTags: ["ledger"],
    }),

    // UPDATE LEDGER
    updateLedger: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/ledger/update-ledger/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["ledger"],
    }),

    // DELETE LEDGER
    deleteLedger: builder.mutation({
      query: (id) => ({
        url: `/ledger/delete-ledger/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ledger"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateLedgerMutation,
  useGetAllLedgersQuery,
  useGetLedgerByIdQuery,
  useUpdateLedgerMutation,
  useDeleteLedgerMutation,
} = ledgerApi;

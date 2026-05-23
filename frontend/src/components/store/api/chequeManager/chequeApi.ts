import { apiSlice } from "../../rootApi/apiSlice";

export const chequeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE CHEQUE
    createCheque: builder.mutation({
      query: (body) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return({
          url: "/cheque/create-cheque",
          method: "POST",
          body: {...body, branchId},
        });
      },
      invalidatesTags: ["cheque"],
    }),

    // GET ALL CHEQUES
    getAllCheques: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/cheque/get-cheque-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["cheque"],
    }),

    // GET CHEQUE BY ID
    getChequeById: builder.query({
      query: (id) => ({
        url: `/cheque/get-cheque/${id}`,
        method: "GET",
      }),
      providesTags: ["cheque"],
    }),

    // UPDATE CHEQUE
    updateCheque: builder.mutation({
      query: ({ id, data }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        return {
          url: `/cheque/update-cheque/${id}`,
          method: "PUT",
          body: { ...data, branchId },
        };
      },
      invalidatesTags: ["cheque"],
    }),

    // DELETE CHEQUE
    deleteCheque: builder.mutation({
      query: (id) => ({
        url: `/cheque/delete-cheque/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cheque"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateChequeMutation,
  useGetAllChequesQuery,
  useGetChequeByIdQuery,
  useUpdateChequeMutation,
  useDeleteChequeMutation,
} = chequeApi;

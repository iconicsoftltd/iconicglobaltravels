import { removeFalsyValuesProperties } from "@/utils/helper/removeFalsyValuesProperties";
import { apiSlice } from "../../rootApi/apiSlice";

export const branchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //  Create Branch
    createBranch: builder.mutation({
      query: (data) => ({
        url: "/branch/create-branch",
        method: "POST",
        body: data, // { name, address }
      }),
      invalidatesTags: ["branch"],
    }),

    //  Get All Branches (with pagination & search)
    getBranchAll: builder.query({
      query: ({ page = 1, size = 100, search = "" }: { page?: number; size?: number; search?: string } = {}) => ({
        url: `/branch/get-branch-all?page=${page}&size=${size}&search=${search}`,
        method: "GET",
      }),
      providesTags: ["branch"],
    }),

    //  Get Branch by ID
    getBranchById: builder.query({
      query: (id) => ({
        url: `/branch/get-branch/${id}`,
        method: "GET",
      }),
      providesTags: ["branch"],
    }),

    //  Update Branch
    updateBranch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/branch/update-branch/${id}`,
        method: "PUT",
        body: removeFalsyValuesProperties(data, ["email", "phone", "logo", "address", ]),
      }),
      invalidatesTags: ["branch"],
    }),

    //  Delete Branch
    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `/branch/delete-branch/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["branch"],
    }),
  }),
});

export const {
  useCreateBranchMutation,
  useGetBranchAllQuery,
  useGetBranchByIdQuery,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;

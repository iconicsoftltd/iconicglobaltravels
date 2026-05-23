import { apiSlice } from "../../rootApi/apiSlice";



export const permissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getPermissionAll: builder.query({
      query: () => ({
        url: "/permission/get-permission-all",
        method: "GET",
      }),
      providesTags: ["permission"],
    }),
  }),
});

export const {
    useGetPermissionAllQuery,
} = permissionApi;

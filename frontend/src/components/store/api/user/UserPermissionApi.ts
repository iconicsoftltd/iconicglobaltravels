import { apiSlice } from "../../rootApi/apiSlice";

export const userPermissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    //  CREATE USER PERMISSION
    createUserPermission: builder.mutation({
      query: (body) => ({
        url: "/user-permission/create-user-permission",
        method: "POST",
        body,
      }),
      invalidatesTags: ["userPermission"],
    }),

    //  GET USER PERMISSION BY USER ID
    getPermissionByUser: builder.query({
      query: (userId) => ({
        url: `/user-permission/get-permission-by-user/${userId}`,
        method: "GET",
      }),
      providesTags: ["userPermission"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateUserPermissionMutation,
  useGetPermissionByUserQuery,
} = userPermissionApi;

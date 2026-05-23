import { apiSlice } from "../../rootApi/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE USER
    createUser: builder.mutation({
      query: (body) => ({
        url: "/user/create-user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["user"],
    }),

    // LOGIN USER
    loginUser: builder.mutation({
      query: (body) => {
        return({
          url: "/user/login-user",
          method: "POST",
          body,
        });
      },
    }),

    // GET ALL USERS
    getAllUsers: builder.query({
      query: ({ page = 1, size = 10, search = "" }) => {
        const selectedBranch = localStorage.getItem("selectedBranch");
        const branchId = selectedBranch ? JSON.parse(selectedBranch).id : "";
        let queryParams = `?page=${page}&size=${size}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;
        if (branchId) queryParams += `&branchId=${branchId}`;
        return {
          url: `/user/get-user-all${queryParams}`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),

    // GET USER BY ID
    getUserById: builder.query({
      query: (id) => ({
        url: `/user/get-user/${id}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    // UPDATE USER
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/user/update-user/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["user"],
    }),

    // UPDATE USER STATUS
    updateUserStatus: builder.mutation({
      query: (id) => ({
        url: `/user/update-user-status/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["user"],
    }),

    // DELETE USER
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/delete-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),

    sendVerification: builder.mutation({
      query: (email) => ({
        url: `/user/send-verification-link/${email}`,
        method: "POST",
      }),
      invalidatesTags: ["user"],
    }),

    verifyAccount: builder.mutation({
      query: (code) => ({
        url: `/user/verify-account/${code}`,
        method: "POST",
      }),
      invalidatesTags: ["user"],
    }),

    // -------------------------------------------
    // NEW API #1: CHANGE PASSWORD (POST)
    // -------------------------------------------
    changePassword: builder.mutation({
      query: (body) => ({
        url: "/user/change-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["user"],
    }),

    // -------------------------------------------
    // NEW API #2: SEND FORGET PASSWORD LINK (POST)
    // -------------------------------------------
    sendForgetPasswordLink: builder.mutation({
      query: (email) => ({
        url: `/user/send-forget-link/${email}`,
        method: "POST",
      }),
      invalidatesTags: ["user"],
    }),

    // -------------------------------------------
    // NEW API #3: FORGET PASSWORD (POST)
    // -------------------------------------------
    forgetPassword: builder.mutation({
      query: (body) => ({
        url: "/user/forget-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["user"],
    }),

    // -------------------------------------------
    // NEW API #4: GET PROFILE (GET)
    // -------------------------------------------
    getProfile: builder.query({
      query: () => ({
        url: "/user/get-profile",
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    // -------------------------------------------
    // NEW API #5: UPDATE PROFILE (PUT)
    // -------------------------------------------
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["user"],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreateUserMutation,
  useLoginUserMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useSendVerificationMutation,
  useVerifyAccountMutation,

  // NEW HOOKS
  useChangePasswordMutation,
  useSendForgetPasswordLinkMutation,
  useForgetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = userApi;

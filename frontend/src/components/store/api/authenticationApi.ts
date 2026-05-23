import { apiSlice } from "../rootApi/apiSlice";

export const authenticationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // LOGIN
    login: builder.mutation({
      query: (credentials) => {
        return {
          url: "/user/login-user",
          method: "POST",
          body: credentials,
        };
      },
    }),

    forgetPassword: builder.mutation({
      query: ({ token, newPassword, confirmPassword }) => ({
        url: `/user/forget-password?token=${token}`,
        method: "POST",
        body: { newPassword, confirmPassword },
      }),
    }),

    forgetPasswordRequest: builder.mutation({
      query: (body) => ({
        url: `/user/forget-password-request`,
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export all hooks together
export const {
  useLoginMutation,
  useForgetPasswordMutation,
  useForgetPasswordRequestMutation,
} = authenticationApi;

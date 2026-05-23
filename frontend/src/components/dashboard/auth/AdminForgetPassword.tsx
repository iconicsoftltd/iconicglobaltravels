import { forgetPasswordSchema, ForgetPasswordSchemaType } from "@/components/schemas/user/forgetPasswordSchema";
import { useForgetPasswordMutation } from "@/components/store/api/authenticationApi";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AdminForgetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const [forget, { isLoading: forgetLoading }] = useForgetPasswordMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ForgetPasswordSchemaType>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  // Inject "code" into RHF (no input field shown)
  useEffect(() => {
    if (code) {
      setValue("code", code);
    }
  }, [code, setValue]);

  // Submit handler
  const onSubmit = async (data: ForgetPasswordSchemaType) => {
    try {
      const result = await forget(data).unwrap();

      toast.success( result?.message || "Password has been reset successfully!");
      navigate("/admin-login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  return (
    <>
      <div className="h-[94vh] flex flex-col md:flex-row overflow-hidden ">
        {/* LEFT SIDE IMAGE */}
        <div
          className="hidden md:flex md:w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${appConfiguration?.loginBg})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
          <div className="absolute right-14 bottom-16 z-10 flex flex-col justify-center items-start p-12 text-white">
            <h1 className="text-4xl font-bold mb-4">Accounts Admin Portal</h1>
            <p className="text-lg text-gray-200 max-w-md leading-relaxed">
              Manage your business accounts, invoices, and transactions securely
              in one place. Streamlined and powerful — designed for
              professionals.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-200">
          <div className="w-full max-w-md p-10 bg-white rounded-md shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary">Reset Password</h2>
              <p className="text-gray-500 mt-2">Enter your new password</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Hidden Code Field */}
              <input type="hidden" {...register("code")} />

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("newPassword")}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    👁
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgetLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  forgetLoading
                    ? "bg-primary/70 cursor-not-allowed"
                    : "bg-primary hover:bg-primary shadow-md hover:shadow-lg"
                }`}
              >
                {forgetLoading ? (
                  <span className="flex items-center justify-center">
                    Processing...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}

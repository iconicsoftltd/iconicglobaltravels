import { zodResolver } from "@hookform/resolvers/zod";
import { jwtDecode } from "jwt-decode";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Components & Utils
import SendVerificationModal from "@/components/common/modals/SendVerificationModal";
import { loginSchema } from "@/components/schemas/loginSchema";
import { useLoginMutation } from "@/components/store/api/authenticationApi";
import {
  useSendForgetPasswordLinkMutation,
  useSendVerificationMutation,
} from "@/components/store/api/user/userApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { loadUserFromToken } from "@/utils/helper/loadUserFromToken";
import { shareAuthentication } from "@/utils/helper/shareAuthentiaction";
import { shareWithCookies } from "@/utils/helper/shareWithCookies";

export default function AdminLogin() {
  const auth = shareAuthentication();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [modalType, setModalType] = useState<"verify" | "forget" | null>(null);
  const [verifyEmail, setVerifyEmail] = useState("");

  // API Mutations
  const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation();
  const [sendVerification, { isLoading: verifyLoading }] = useSendVerificationMutation();
  const [sendForgetLink, { isLoading: forgetLoading }] = useSendForgetPasswordLinkMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (auth?.email) {
      navigate("/admin_home", { replace: true });
    }
  }, [auth, navigate]);

  const onSubmit = async (data: any) => {
    try {
      const result = await login(data).unwrap();
      const token = result?.token || "";
      const authData = jwtDecode(token) as any;
      const role = authData?.role?.toLowerCase();

      if (role === "user") {
        setError("root", { message: "Access Denied: Admin privileges required." });
        toast.error("Unauthorized Access");
        return;
      }

      toast.success(`Welcome back, ${authData.name || "Admin"}`);
      
      // Store Token (1440 mins = 24 hours)
      shareWithCookies("set", `${appConfiguration.appCode}token`, 1440, token);
      loadUserFromToken(dispatch);
      
      navigate("/admin_home");
    } catch (error: any) {
      const msg = error?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
    }
  };

  const handleModalAction = async () => {
    if (!verifyEmail) return toast.error("Email is required");

    try {
      if (modalType === "verify") {
        await sendVerification(verifyEmail).unwrap();
        toast.success("Verification link sent!");
      } else {
        await sendForgetLink(verifyEmail).unwrap();
        toast.success("Reset link sent!");
        navigate("/forget-password");
      }
      setModalType(null);
      setVerifyEmail("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  return (
    <div className="min-h-[94vh] flex bg-slate-50">
      {/* LEFT SIDE: Brand & Aesthetic */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden"
        style={{
          backgroundImage: `url(${appConfiguration?.loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/40 to-black/60" />
        <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
          <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Accounts Admin Portal
            </h1>
            <p className="text-lg text-slate-100 max-w-md leading-relaxed opacity-90">
              The command center for your business finances. Manage invoices, 
              track transactions, and oversee account security with precision.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Sign In</h2>
            <p className="text-slate-500 mt-3 font-medium">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="admin@ipfaccount.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-red-500 ml-1">{errors.email.message as string}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <button 
                  type="button"
                  onClick={() => setModalType("forget")}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message as string}</p>}
            </div>

            {/* Error Alerts */}
            {(loginError || errors.root) && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">Login Failed</AlertTitle>
                <AlertDescription className="text-xs">
                  {errors.root?.message || (loginError as any)?.data?.message || "Something went wrong."}
                </AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loginLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign Into Account"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setModalType("verify")}
                className="text-sm text-slate-500 hover:text-primary font-medium transition-colors"
              >
                Account not verified? <span className="text-primary underline underline-offset-4">Resend link</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reusable Modal Trigger */}
      <SendVerificationModal
        open={!!modalType}
        onOpenChange={(open) => !open && setModalType(null)}
        title={modalType === "verify" ? "Verify Email" : "Reset Password"}
        des={
          modalType === "verify" 
            ? "We'll send a link to activate your admin account." 
            : "Enter your email to receive instructions to reset your password."
        }
        verifyEmail={verifyEmail}
        setVerifyEmail={setVerifyEmail}
        verifyLoading={modalType === "verify" ? verifyLoading : forgetLoading}
        onSend={handleModalAction}
      />
    </div>
  );
}
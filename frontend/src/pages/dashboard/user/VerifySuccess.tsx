"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useVerifyAccountMutation } from "@/components/store/api/user/userApi";

export default function VerifySuccess() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();

  const [verifyAccount] = useVerifyAccountMutation();
  const [status, setStatus] = useState<"success" | "error" | "pending">(
    "pending",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("Verification code not found in URL");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyAccount(code).unwrap();
        setStatus("success");
        setMessage(result?.message || "Account verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.data?.message || "Verification failed!");
      }
    };

    verify();
  }, [code, verifyAccount]);

  return (
    <div className="h-[90vh] flex flex-col justify-center items-center bg-gray-100">
      {status === "pending" && (
        <p className="text-lg">Verifying your account...</p>
      )}

      {status === "success" && (
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button className="mt-6" onClick={() => navigate("/admin-login")}>
        Go to Login
      </Button>
    </div>
  );
}

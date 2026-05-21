"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail, resendVerificationEmail } from "@/services/auth.service";

type VerificationState = "loading" | "success" | "error" | "already-verified";

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Token xác minh không hợp lệ");
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);

        if (response.message.includes("đã được xác minh trước đó")) {
          setState("already-verified");
          setMessage(response.message);
        } else {
          setState("success");
          setMessage(response.message);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=1");
          }, 3000);
        }
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "Xác minh email thất bại");
      }
    };

    verify();
  }, [token, router]);

  const handleResendEmail = async () => {
    const email = prompt("Vui lòng nhập email của bạn:");

    if (!email) {
      return;
    }

    setIsResending(true);
    setResendMessage("");

    try {
      const response = await resendVerificationEmail(email);
      setResendMessage(response.message);
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : "Gửi lại email thất bại");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Icon */}
      <div className="relative">
        {state === "loading" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--primary-blue)/10">
            <Loader2 className="h-10 w-10 animate-spin text-(--primary-blue)" />
          </div>
        )}

        {state === "success" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        )}

        {state === "already-verified" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
        )}

        {state === "error" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {state === "loading" && "Đang xác minh email..."}
          {state === "success" && "Xác minh thành công!"}
          {state === "already-verified" && "Email đã được xác minh"}
          {state === "error" && "Xác minh thất bại"}
        </h1>

        <p className="text-base text-(--gray-600)">
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        {state === "success" && (
          <p className="text-sm text-(--gray-500)">
            Đang chuyển hướng đến trang đăng nhập...
          </p>
        )}

        {(state === "already-verified" || state === "success") && (
          <Button
            asChild
            className="w-full h-12 rounded-2xl bg-linear-to-r from-(--primary-blue) to-(--accent-purple) text-base font-black text-white shadow-xl shadow-blue-200/70 hover:opacity-95"
          >
            <Link href="/login">
              Đăng nhập ngay
            </Link>
          </Button>
        )}

        {state === "error" && (
          <>
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full h-12 rounded-2xl bg-linear-to-r from-(--primary-blue) to-(--accent-purple) text-base font-black text-white shadow-xl shadow-blue-200/70 hover:opacity-95"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi lại email xác minh
                </>
              )}
            </Button>

            {resendMessage && (
              <p className={`text-sm ${resendMessage.includes("thất bại") ? "text-red-600" : "text-green-600"}`}>
                {resendMessage}
              </p>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-2xl border-(--gray-200) text-base font-bold"
            >
              <Link href="/register">
                Quay lại đăng ký
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-sm text-(--gray-500)">
        Cần hỗ trợ?{" "}
        <Link href="/contact" className="font-bold text-(--primary-blue) hover:text-(--blue-dark)">
          Liên hệ chúng tôi
        </Link>
      </p>
    </div>
  );
}

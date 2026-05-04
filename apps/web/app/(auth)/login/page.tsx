"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { FcGoogle } from "react-icons/fc";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/schemas/auth.schema";
import { login, saveAuthTokens } from "@/services/auth.service";

type LoginFieldErrors = Partial<Record<"email" | "password", string>>;

const features: { icon: LucideIcon; text: string }[] = [
  { icon: ShieldCheck, text: "Bảo mật tài khoản bằng phiên đăng nhập" },
  { icon: BriefcaseBusiness, text: "Theo dõi cơ hội việc làm mỗi ngày" },
  { icon: Sparkles, text: "Nhận đề xuất CV và job phù hợp" },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registered = searchParams.get("registered") === "1";
  const sessionExpired = searchParams.get("sessionExpired") === "1";
  const redirectAfterLogin = searchParams.get("redirect") || "/jobs";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const payload = loginSchema.safeParse(data);

    if (!payload.success) {
      const fieldErrors = payload.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      setServerError("");
      return;
    }

    setErrors({});
    setServerError("");
    setIsSubmitting(true);

    try {
      const tokens = await login(payload.data);
      saveAuthTokens(tokens);
      router.push(redirectAfterLogin);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="overflow-auto lg:overflow-hidden min-h-screen bg-(--gray-100) px-4 py-8 text-(--gray-900) sm:px-6 lg:px-8">
      <Card className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-(--gray-200) bg-(--white) shadow-2xl lg:min-h-180 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-linear-to-br from-(--blue-dark) via-(--primary-blue) to-(--accent-purple) p-10 text-white lg:flex lg:flex-col xl:p-12">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-black backdrop-blur">
              JM
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black leading-tight">Job Matcher</p>
              <p className="text-sm font-medium text-white/70">Welcome back</p>
            </div>
          </div>

          <div className="relative z-10 mt-16 max-w-130 space-y-6">
            <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">Welcome back to your career dashboard.</h1>
            <p className="max-w-115 text-lg leading-8 text-white/80">
              Đăng nhập để tiếp tục theo dõi vị trí đã lưu, tối ưu CV và xem kết quả matching mới nhất.
            </p>
          </div>

          <div className="relative z-10 mt-auto space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 font-semibold backdrop-blur"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <CardContent className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="w-full max-w-130">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--primary-blue) text-sm font-black text-white">
                JM
              </div>
              <div>
                <p className="text-xl font-black">Job Matcher</p>
                <p className="text-sm font-medium text-(--gray-500)">Welcome back</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Đăng nhập</h2>
              <p className="text-base text-(--gray-500) sm:text-lg">Tiếp tục hành trình ứng tuyển của bạn.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {sessionExpired ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
                </p>
              ) : null}

              {registered ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Tạo tài khoản thành công. Vui lòng đăng nhập để tiếp tục.
                </p>
              ) : null}

              {serverError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {serverError}
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="luuhanh0201@gmail.com"
                  className="h-12 rounded-2xl border-(--gray-200) bg-(--gray-100)/60"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <p className="text-sm font-medium text-red-500">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  className="h-12 rounded-2xl border-(--gray-200) bg-(--gray-100)/60"
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password ? <p className="text-sm font-medium text-red-500">{errors.password}</p> : null}
              </div>

              <Button
                type="submit"
                className="h-14 w-full rounded-2xl bg-linear-to-r from-(--primary-blue) to-(--accent-purple) text-base font-black text-white shadow-xl shadow-blue-200/70 hover:opacity-95"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-(--gray-200)" />
              <span className="text-sm text-(--gray-500)">hoặc đăng nhập bằng</span>
              <div className="h-px flex-1 bg-(--gray-200)" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Button type="button" variant="outline" className="h-12 rounded-2xl border-(--gray-200) font-bold">
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button type="button" variant="outline" className="h-12 rounded-2xl border-(--gray-200) font-bold">
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm bg-[#0A66C2] text-[10px] font-black text-white">
                  in
                </span>
                LinkedIn
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-(--gray-500)">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-bold text-(--primary-blue) hover:text-(--blue-dark)">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
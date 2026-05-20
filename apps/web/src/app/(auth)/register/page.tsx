"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/schemas/auth.schema";
import { register } from "@/services/auth.service";

type RegisterFieldErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

const features: { icon: LucideIcon; text: string }[] = [
  { icon: FileText, text: "Lưu nhiều phiên bản CV" },
  { icon: BriefcaseBusiness, text: "Theo dõi job đã ứng tuyển" },
  { icon: Sparkles, text: "Nhận lộ trình nâng cấp kỹ năng" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const payload = registerSchema.safeParse(data);

    if (!payload.success) {
      const fieldErrors = payload.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      setServerError("");
      return;
    }

    setErrors({});
    setServerError("");
    setIsSubmitting(true);

    try {
      await register(payload.data);
      router.push("/login?registered=1");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="overflow-auto lg:overflow-hidden min-h-screen bg-(--gray-100) px-4 py-8 text-(--gray-900) sm:px-6 lg:px-8">
      <Card className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-(--gray-200) bg-(--white) shadow-2xl lg:min-h-180 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-linear-to-br from-(--primary-blue) via-(--blue-dark) to-(--accent-purple) p-10 text-white lg:flex lg:flex-col xl:p-12">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-black backdrop-blur">
              JM
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black leading-tight">Job Matcher</p>
              <p className="text-sm font-medium text-white/70">Start your profile</p>
            </div>
          </div>

          <div className="relative z-10 mt-16 max-w-130 space-y-6">
            <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">Create your smart career profile.</h1>
            <p className="max-w-115 text-lg leading-8 text-white/80">
              Đăng ký tài khoản để lưu CV, theo dõi job match và nhận đề xuất việc làm phù hợp mỗi ngày.
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
                <p className="text-sm font-medium text-(--gray-500)">Start your profile</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Tạo tài khoản</h2>
              <p className="text-base text-(--gray-500) sm:text-lg">Bắt đầu miễn phí với Job Matcher.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {serverError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {serverError}
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-bold">
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="VD: Lưu Đình Hạnh"
                  className="h-12 rounded-2xl border-(--gray-200) bg-(--gray-100)/60"
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName ? <p className="text-sm font-medium text-red-500">{errors.fullName}</p> : null}
              </div>

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
                  placeholder="Tối thiểu 8 ký tự"
                  className="h-12 rounded-2xl border-(--gray-200) bg-(--gray-100)/60"
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password ? <p className="text-sm font-medium text-red-500">{errors.password}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-bold">
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  className="h-12 rounded-2xl border-(--gray-200) bg-(--gray-100)/60"
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                {errors.confirmPassword ? (
                  <p className="text-sm font-medium text-red-500">{errors.confirmPassword}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="h-14 w-full rounded-2xl bg-linear-to-r from-(--primary-blue) to-(--accent-purple) text-base font-black text-white shadow-xl shadow-blue-200/70 hover:opacity-95"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
            </form>

           
            <p className="mt-6 text-center text-sm text-(--gray-500)">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-(--primary-blue) hover:text-(--blue-dark)">
                Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

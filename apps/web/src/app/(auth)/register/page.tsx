"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlideUp } from "@/components/motion/slide-up";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/schemas/auth.schema";
import { register } from "@/services/auth.service";
import { toast } from "sonner";

type RegisterFieldErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword", string>>;

const features: { icon: LucideIcon; text: string }[] = [
  { icon: FileText, text: "Lưu nhiều phiên bản CV" },
  { icon: BriefcaseBusiness, text: "Theo dõi job đã ứng tuyển" },
  { icon: Sparkles, text: "Nhận lộ trình nâng cấp kỹ năng" },
];

const stats: { value: string; label: string }[] = [
  { value: "10,000+", label: "Việc làm" },
  { value: "5,000+", label: "Ứng viên" },
  { value: "98%", label: "Độ chính xác AI" },
];

export default function RegisterPage() {
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

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
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await register(payload.data);
      setIsRegistered(true);
      toast.success(response.message);
      toast.info("Vui lòng kiểm tra hộp thư đến (hoặc thư rác) để xác minh email của bạn.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="overflow-auto lg:overflow-hidden min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <SlideUp className="mx-auto w-full max-w-6xl">
      <Card className="grid w-full overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl shadow-primary/10 lg:min-h-180 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary/90 to-accent p-10 text-primary-foreground lg:flex lg:flex-col xl:p-12">
          <motion.div
            className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl"
            animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, -14, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-warning/25 blur-3xl"
            animate={{ x: [0, 16, 0], y: [0, -20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 mt-12 max-w-130 space-y-6">
            <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">Tạo hồ sơ sự nghiệp thông minh của bạn.</h1>
            <p className="max-w-115 text-lg leading-8 text-white/80">
              Đăng ký tài khoản để lưu CV, theo dõi job match và nhận đề xuất việc làm phù hợp mỗi ngày.
            </p>
          </div>

          <div className="relative z-10 mt-10 flex flex-wrap gap-3">
            {stats.map(({ value, label }, index) => (
              <motion.div
                key={label}
                className={`rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl ${index === 1 ? "rotate-1" : "-rotate-1"}`}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                }}
              >
                <p className="text-xl font-black leading-none">{value}</p>
                <p className="mt-1 text-xs font-medium text-white/70">{label}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 mt-auto space-y-4 pt-10">
            {features.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 font-semibold backdrop-blur-xl"
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground">
                JM
              </div>
              <div>
                <p className="text-xl font-black">Job Matcher</p>
                <p className="text-sm font-medium text-muted-foreground">Bắt đầu hồ sơ của bạn</p>
              </div>
            </div>

            <motion.div
              className="relative z-10 mx-auto mb-6 flex w-fit items-center rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Logo variant="light" className="h-32 w-auto" priority />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Tạo tài khoản</h2>
              <p className="text-base text-muted-foreground sm:text-lg">Bắt đầu miễn phí với Job Matcher.</p>
            </div>

            <form className="mt-8" onSubmit={handleSubmit} noValidate>
              {isRegistered ? (
                <Link
                  href="/login"
                  className="mb-5 inline-block text-sm font-bold text-primary underline"
                >
                  Đi đến trang đăng nhập
                </Link>
              ) : null}

              <StaggerList className="space-y-5">
                <StaggerItem className="space-y-2">
                  <Label htmlFor="fullName" className="font-bold">
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="VD: Lưu Đình Hạnh"
                    className="h-12 rounded-2xl border-border bg-muted/60"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName ? <p className="text-sm font-medium text-red-500">{errors.fullName}</p> : null}
                </StaggerItem>

                <StaggerItem className="space-y-2">
                  <Label htmlFor="email" className="font-bold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="luuhanh0201@gmail.com"
                    className="h-12 rounded-2xl border-border bg-muted/60"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? <p className="text-sm font-medium text-red-500">{errors.email}</p> : null}
                </StaggerItem>

                <StaggerItem className="space-y-2">
                  <Label htmlFor="password" className="font-bold">
                    Mật khẩu
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className="h-12 rounded-2xl border-border bg-muted/60"
                    aria-invalid={Boolean(errors.password)}
                  />
                  {errors.password ? <p className="text-sm font-medium text-red-500">{errors.password}</p> : null}
                </StaggerItem>

                <StaggerItem className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-bold">
                    Xác nhận mật khẩu
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    className="h-12 rounded-2xl border-border bg-muted/60"
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                  {errors.confirmPassword ? (
                    <p className="text-sm font-medium text-red-500">{errors.confirmPassword}</p>
                  ) : null}
                </StaggerItem>

                <StaggerItem>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl bg-linear-to-r from-primary to-accent text-base font-black text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-95"
                    disabled={isSubmitting || isRegistered}
                  >
                    {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </Button>
                </StaggerItem>
              </StaggerList>
            </form>

           
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-primary hover:text-primary/80">
                Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </SlideUp>
    </main>
  );
}

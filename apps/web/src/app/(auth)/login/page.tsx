"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlideUp } from "@/components/motion/slide-up";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, login, saveAuthTokens } from "@/services/auth.service";
import { getHomeRouteForRole } from "@/lib/role-check";
import { loginSchema } from "@/schemas/auth.schema";
import { loginWithGoogle } from "@/services/auth-google.service";
import { FacebookLoginResponse } from "@/types/facebook-login-response.type";
import { loginWithFacebook } from "@/services/auth-facebook.service";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { FaSquareFacebook } from "react-icons/fa6";
import { toast } from "sonner";
type LoginFieldErrors = Partial<Record<"email" | "password", string>>;

const features: { icon: LucideIcon; text: string }[] = [
  { icon: ShieldCheck, text: "Bảo mật tài khoản bằng phiên đăng nhập" },
  { icon: BriefcaseBusiness, text: "Theo dõi cơ hội việc làm mỗi ngày" },
  { icon: Sparkles, text: "Nhận đề xuất CV và job phù hợp" },
];

const stats: { value: string; label: string }[] = [
  { value: "10,000+", label: "Việc làm" },
  { value: "5,000+", label: "Ứng viên" },
  { value: "98%", label: "Độ chính xác AI" },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registered = searchParams.get("registered") === "1";
  const sessionExpired = searchParams.get("sessionExpired") === "1";
  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    if (sessionExpired) {
      toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    if (registered) {
      toast.success("Tạo tài khoản thành công. Vui lòng đăng nhập để tiếp tục.");
    }
  }, [registered, sessionExpired]);

  // Ưu tiên redirect cụ thể (người dùng bị chặn ở 1 trang bảo vệ); nếu không có
  // thì điều hướng về trang chủ theo vai trò (admin/recruiter/candidate).
  const redirectAfterLogin = async () => {
    if (redirectParam && redirectParam !== "/") {
      return redirectParam;
    }

    try {
      const profile = await getProfile();
      return getHomeRouteForRole(profile.role);
    } catch {
      return "/";
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      try {
        const tokens = await loginWithGoogle(tokenResponse.access_token);
        saveAuthTokens(tokens);
        router.push(await redirectAfterLogin());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Đăng nhập bằng Google thất bại");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập bằng Google bị huỷ hoặc lỗi");
    },
  });

  const handleFacebookSuccess = async (facebookLoginResponse: FacebookLoginResponse) => {
    if (isSubmitting) {
      return;
    }

    if (!facebookLoginResponse.accessToken) {
      toast.error("Facebook login không trả về access token");
      return;
    }

    setIsSubmitting(true);

    try {
      const tokens = await loginWithFacebook(facebookLoginResponse.accessToken);
      saveAuthTokens(tokens);
      router.push(await redirectAfterLogin());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập bằng Facebook thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFacebookError = () => {
    toast.error("Đăng nhập bằng Facebook bị huỷ hoặc lỗi");
  };

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
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const tokens = await login(payload.data);
      saveAuthTokens(tokens);
      router.push(await redirectAfterLogin());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="overflow-auto lg:overflow-hidden min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <SlideUp className="mx-auto w-full max-w-6xl">
      <Card className="grid w-full overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl shadow-primary/10 lg:min-h-180 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-linear-to-br from-primary/90 via-primary to-accent p-10 text-primary-foreground lg:flex lg:flex-col xl:p-12">
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
            <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">Chào mừng trở lại với hành trình sự nghiệp của bạn.</h1>
            <p className="max-w-115 text-lg leading-8 text-white/80">
              Đăng nhập để tiếp tục theo dõi vị trí đã lưu, tối ưu CV và xem kết quả matching mới nhất.
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
                <p className="text-sm font-medium text-muted-foreground">Chào mừng trở lại</p>
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
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Đăng nhập</h2>
              <p className="text-base text-muted-foreground sm:text-lg">Tiếp tục hành trình ứng tuyển của bạn.</p>
            </div>

            <form className="mt-8" onSubmit={handleSubmit} noValidate>
              <StaggerList className="space-y-5">
                <StaggerItem className="space-y-2">
                  <Label htmlFor="email" className="font-bold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="luuhanh0201@gmail.com"
                    className="h-12 rounded-2xl border-border bg-background/60"
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
                    placeholder="Nhập mật khẩu của bạn"
                    className="h-12 rounded-2xl border-border bg-background/60"
                    aria-invalid={Boolean(errors.password)}
                  />
                  {errors.password ? <p className="text-sm font-medium text-red-500">{errors.password}</p> : null}
                </StaggerItem>

                <StaggerItem>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl bg-linear-to-r from-primary to-accent text-base font-black text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-95"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </StaggerItem>
              </StaggerList>
            </form>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">hoặc đăng nhập bằng</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => googleLogin()}
                disabled={isSubmitting}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <FacebookLogin
                appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!}
                onSuccess={handleFacebookSuccess}
                onFail={handleFacebookError}
                scope="email,public_profile"
                fields="name,email"
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={isSubmitting}
                    className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaSquareFacebook className="h-5 w-5 text-blue-600"  />
                    Facebook
                  </button>
                )}
              />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-bold text-primary hover:text-primary/80">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </SlideUp>
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

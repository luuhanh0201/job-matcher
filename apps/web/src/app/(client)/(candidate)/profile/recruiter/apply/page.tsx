"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CircleDashed, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { createRecruiterProfile } from "@/services/recruiter.service";

type FieldErrors = {
  contactPhone?: string;
  contactEmail?: string;
};

function validatePhone(value: string) {
  const trimmedValue = value.trim();
  const numericValue = trimmedValue.replace(/\D/g, "");

  if (!trimmedValue) {
    return "Vui lòng nhập số điện thoại liên hệ.";
  }

  if (numericValue.length < 9 || numericValue.length > 11) {
    return "Số điện thoại cần có từ 9 đến 11 chữ số.";
  }

  return undefined;
}

function validateEmail(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
  if (!isValidEmail) {
    return "Email liên hệ chưa đúng định dạng.";
  }

  return undefined;
}

export default function ApplyRecruiterPage() {
  const router = useRouter();
  const { user, isLoading, refreshProfile } = useAuth();
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touchedFields, setTouchedFields] = useState<Record<keyof FieldErrors, boolean>>({
    contactPhone: false,
    contactEmail: false,
  });

  const fieldErrors: FieldErrors = {
    contactPhone: validatePhone(contactPhone),
    contactEmail: validateEmail(contactEmail),
  };
  const isFormValid = !fieldErrors.contactPhone && !fieldErrors.contactEmail;

  useEffect(() => {
    if (!user) {
      return;
    }

    setContactEmail(user.email ?? "");

    if (user.role === "RECRUITER") {
      router.replace("/recruiter");
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouchedFields({
      contactPhone: true,
      contactEmail: true,
    });

    if (!isFormValid) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createRecruiterProfile({
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim() || undefined,
      });
      await refreshProfile();
      router.push("/recruiter");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đăng ký nhà tuyển dụng",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldBlur = (field: keyof FieldErrors) => {
    setTouchedFields((currentState) => ({ ...currentState, [field]: true }));
  };

  const handlePhoneChange = (value: string) => {
    setContactPhone(value);
    if (error) {
      setError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setContactEmail(value);
    if (error) {
      setError("");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
          <p className="text-sm font-medium text-(--gray-500)">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-(--primary-blue) via-[#1663d6] to-[#0b2454] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
            Recruiter onboarding
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Hoàn thiện hồ sơ để bắt đầu đăng tuyển.
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            Điền thông tin bên dưới để chúng tôi có thể liên hệ với bạn khi có ứng viên phù hợp.
          </p>
        </div>
        <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-cyan-300/15 blur-2xl" />
      </section>

      <Card className="rounded-3xl border border-(--gray-200) bg-white/95 py-0 shadow-sm">
        <CardHeader className="border-b border-(--gray-200) py-5">
          <CardTitle className="flex items-center gap-2 text-(--gray-900)">
            <Building2 className="h-5 w-5 text-(--primary-blue)" />
            Thông tin nhà tuyển dụng
          </CardTitle>
          <CardDescription>
            Đây sẽ là thông tin hiển thị trên trang hồ sơ tuyển dụng của bạn và dùng để liên hệ khi có ứng viên phù hợp. Bạn có thể chỉnh sửa thông tin này sau khi tạo hồ sơ.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Số điện thoại liên hệ</Label>
              <div className="relative">
                <Phone
                  className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    touchedFields.contactPhone && fieldErrors.contactPhone
                      ? "text-red-500"
                      : "text-(--gray-500)"
                  }`}
                />
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  onBlur={() => handleFieldBlur("contactPhone")}
                  placeholder="Nhập số điện thoại liên hệ"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                  aria-invalid={Boolean(touchedFields.contactPhone && fieldErrors.contactPhone)}
                  required
                />
              </div>
              {touchedFields.contactPhone && fieldErrors.contactPhone ? (
                <p className="text-sm font-medium text-red-500">{fieldErrors.contactPhone}</p>
              ) : (
                <p className="text-xs text-(--gray-500)">
                  Gợi ý: nhập số điện thoại đang dùng để nhận liên hệ tuyển dụng.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Email liên hệ</Label>
              <div className="relative">
                <Mail
                  className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    touchedFields.contactEmail && fieldErrors.contactEmail
                      ? "text-red-500"
                      : "text-(--gray-500)"
                  }`}
                />
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  onBlur={() => handleFieldBlur("contactEmail")}
                  placeholder="Nhập email liên hệ"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                  aria-invalid={Boolean(touchedFields.contactEmail && fieldErrors.contactEmail)}
                />
              </div>
              {touchedFields.contactEmail && fieldErrors.contactEmail ? (
                <p className="text-sm font-medium text-red-500">{fieldErrors.contactEmail}</p>
              ) : (
                <p className="text-xs text-(--gray-500)">
                  Nếu để trống, backend sẽ dùng email tài khoản hiện tại.
                </p>
              )}
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-(--gray-200) pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-(--gray-500)">
                Sau khi tạo hồ sơ, bạn có thể bắt đầu đăng tuyển và quản lý ứng viên phù hợp.
              </p>
              <Button
                type="submit"
                size="lg"
                className="h-11 rounded-xl bg-(--primary-blue) px-5 font-bold text-white hover:bg-(--blue-dark)"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <>
                    <CircleDashed className="h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  "Apply làm nhà tuyển dụng"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
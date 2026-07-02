"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Camera, Check, CircleDashed, Mail, Phone, Users, X } from "lucide-react";
import { toast } from "sonner";
import { getInitials, useAuth } from "@/context/auth-context";
import { getProfileRecruiter, updateRecruiterAvatar } from "@/services/user.service";
import { avatarFileSchema } from "@/schemas/candidate-profile.schema";
import { RecruiterProfile } from "@/types/recruiter-profile";


export default function RecruiterCompanyProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const recruiterProfile = await getProfileRecruiter();
        setRecruiterProfile(recruiterProfile);
      } catch (error) {
        console.error("Error fetching recruiter profile:", error);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationResult = avatarFileSchema.safeParse(file);
    if (!validationResult.success) {
      toast.error(
        validationResult.error.issues[0]?.message || "Ảnh đại diện không hợp lệ",
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return previewUrl;
    });
    setIsAvatarSubmitting(true);

    try {
      const updatedProfile = await updateRecruiterAvatar(file);
      setRecruiterProfile(updatedProfile);
      setAvatarPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return "";
      });
      await refreshProfile().catch(() => null);
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (error) {
      setAvatarPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return "";
      });
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật ảnh đại diện",
      );
    } finally {
      setIsAvatarSubmitting(false);
    }
  };

  const profileFields = [
  { label: "Họ và tên", value: `${recruiterProfile?.fullName}`, icon: Users },
  { label: "Số điện thoại liên hệ", value: `${recruiterProfile?.contactPhone || "Chưa cập nhật"}`, icon: Phone },
  { label: "Email tuyển dụng", value: `${recruiterProfile?.contactEmail || "Chưa cập nhật"}`, icon: Mail },
  { label: "Email cá nhân", value: `${user?.email}`, icon: Mail },
];
  const profileName = recruiterProfile?.fullName || user?.fullName || "Nhà tuyển dụng";
  const avatarUrl = avatarPreviewUrl || recruiterProfile?.avatar || user?.avatar || "";
  const isVerified = recruiterProfile?.isVerified ?? false;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-foreground">Hồ sơ nhà tuyển dụng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý thông tin hồ sơ và công ty của bạn để thu hút ứng viên phù hợp.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <div className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-black text-primary">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={profileName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(profileName)
              )}
              <label
                htmlFor="recruiterAvatar"
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Đổi ảnh đại diện"
              >
                {isAvatarSubmitting ? (
                  <CircleDashed className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </label>
              <input
                id="recruiterAvatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={isAvatarSubmitting}
                onChange={handleAvatarChange}
              />
            </div>
            <div
              className={`pointer-events-none absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card ${
                isVerified ? "bg-primary" : "bg-muted-foreground"
              }`}
              title={isVerified ? "Tài khoản đã xác minh" : "Tài khoản chưa xác minh"}
            >
              {isVerified ? (
                <Check className="h-3.5 w-3.5 text-white" />
              ) : (
                <X className="h-3.5 w-3.5 text-white" />
              )}
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{recruiterProfile?.fullName}</p>
            <p className={`mt-1 text-xs font-semibold ${isVerified ? "text-primary" : "text-muted-foreground"}`}>
              {isVerified ? "Đã xác minh" : "Chưa xác minh"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profileFields.map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-xl border border-border p-3">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-4 w-4" /> {label}
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground">Cài đặt thông báo</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Chúng tôi xây dựng nền tảng kết nối doanh nghiệp với ứng viên phù hợp bằng AI, giúp tối ưu thời gian tuyển dụng và nâng cao trải nghiệm tuyển chọn.
        </p>
      </section>
    </div>
  );
}

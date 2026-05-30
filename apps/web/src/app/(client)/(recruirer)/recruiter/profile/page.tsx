"use client";
import { getInitials, useAuth } from "@/context/auth-context";
import { getProfileRecruiter } from "@/services/user.service";
import { RecruiterProfile } from "@/types/recruiter-profile";
import { Check, Mail, Phone, Users, X } from "lucide-react";
import { useEffect, useState } from "react";


export default function RecruiterCompanyProfilePage() {
  const {user} = useAuth();
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
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
  const profileFields = [
  { label: "Họ và tên", value: `${recruiterProfile?.fullName}`, icon: Users },
  { label: "Số điện thoại liên hệ", value: `${recruiterProfile?.contactPhone || "Chưa cập nhật"}`, icon: Phone },
  { label: "Email tuyển dụng", value: `${recruiterProfile?.contactEmail || "Chưa cập nhật"}`, icon: Mail },
  { label: "Email cá nhân", value: `${user?.email}`, icon: Mail },
];
  const profileName = recruiterProfile?.fullName || user?.fullName || "Nhà tuyển dụng";
  const isVerified = recruiterProfile?.isVerified ?? false;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">Hồ sơ nhà tuyển dụng</h1>
        <p className="mt-1 text-sm text-(--gray-500)">
          Quản lý thông tin hồ sơ và công ty của bạn để thu hút ứng viên phù hợp.
        </p>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--blue-light) text-xl font-black text-(--primary-blue)">
              {getInitials(profileName)}
            </div>
            <div
              className={`absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white ${
                isVerified ? "bg-(--blue-dark)" : "bg-(--gray-500)"
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
            <p className="text-lg font-black text-(--gray-900)">{recruiterProfile?.fullName}</p>
            <p className={`mt-1 text-xs font-semibold ${isVerified ? "text-(--blue-dark)" : "text-(--gray-500)"}`}>
              {isVerified ? "Đã xác minh" : "Chưa xác minh"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {profileFields.map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-xl border border-(--gray-200) p-3">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-(--gray-500)">
                <Icon className="h-4 w-4" /> {label}
              </p>
              <p className="mt-1 text-sm font-bold text-(--gray-900)">{value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-(--gray-300) bg-white p-5">
        <p className="text-sm font-semibold text-(--gray-700)">Cài đặt thông báo</p>
        <p className="mt-2 text-sm text-(--gray-500)">
          Chúng tôi xây dựng nền tảng kết nối doanh nghiệp với ứng viên phù hợp bằng AI, giúp tối ưu thời gian tuyển dụng và nâng cao trải nghiệm tuyển chọn.
        </p>
      </section>
    </div>
  );
}

import { Building2, Globe, MapPin, Phone } from "lucide-react";

const profileFields = [
  { label: "Tên công ty", value: "Job Matcher Co., Ltd.", icon: Building2 },
  { label: "Địa chỉ", value: "Quận 1, TP.HCM", icon: MapPin },
  { label: "Website", value: "https://jobmatcher.vn", icon: Globe },
  { label: "Hotline", value: "1900 xxxx", icon: Phone },
];

export default function RecruiterCompanyProfilePage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">Hồ sơ công ty</h1>
        <p className="mt-1 text-sm text-(--gray-500)">
          Cập nhật thông tin thương hiệu tuyển dụng để thu hút ứng viên phù hợp hơn.
        </p>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--blue-light) text-(--primary-blue)">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-black text-(--gray-900)">Job Matcher Co., Ltd.</p>
            <p className="text-sm text-(--gray-500)">Technology - AI Recruitment Platform</p>
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
        <p className="text-sm font-semibold text-(--gray-700)">Giới thiệu công ty (placeholder)</p>
        <p className="mt-2 text-sm text-(--gray-500)">
          Chúng tôi xây dựng nền tảng kết nối doanh nghiệp với ứng viên phù hợp bằng AI, giúp tối ưu thời gian tuyển dụng và nâng cao trải nghiệm tuyển chọn.
        </p>
      </section>
    </div>
  );
}

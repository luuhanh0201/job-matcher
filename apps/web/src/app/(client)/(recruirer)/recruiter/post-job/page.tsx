import { BriefcaseBusiness, CircleCheckBig, CopyPlus, Sparkles } from "lucide-react";

const postingSteps = [
  {
    title: "Thông tin cơ bản",
    desc: "Tên vị trí, phòng ban, loại hình, cấp bậc",
    icon: BriefcaseBusiness,
  },
  {
    title: "Mô tả công việc",
    desc: "Nhiệm vụ chính, yêu cầu bắt buộc, kỹ năng ưu tiên",
    icon: CopyPlus,
  },
  {
    title: "Tối ưu bằng AI",
    desc: "Gợi ý câu chữ để tăng tỉ lệ apply",
    icon: Sparkles,
  },
  {
    title: "Xem trước và đăng",
    desc: "Kiểm tra lại thông tin trước khi publish",
    icon: CircleCheckBig,
  },
];

export default function RecruiterPostJobPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">Đăng tin tuyển dụng</h1>
        <p className="mt-1 text-sm text-(--gray-500)">
          Trang này là khung tạo tin tuyển dụng. Bạn có thể nối form thật vào API sau khi chốt schema backend.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {postingSteps.map(({ title, desc, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--blue-light) text-(--primary-blue)">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-sm font-bold text-(--gray-900)">{title}</p>
            <p className="mt-1 text-xs text-(--gray-500)">{desc}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-(--gray-300) bg-white p-5">
        <p className="text-sm font-semibold text-(--gray-700)">Placeholder form</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-11 rounded-xl bg-(--gray-100)" />
          <div className="h-11 rounded-xl bg-(--gray-100)" />
          <div className="h-11 rounded-xl bg-(--gray-100) sm:col-span-2" />
          <div className="h-28 rounded-xl bg-(--gray-100) sm:col-span-2" />
        </div>
      </section>
    </div>
  );
}

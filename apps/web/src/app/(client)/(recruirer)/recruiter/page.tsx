import Link from "next/link";
import { CalendarClock, ChevronRight, FileCheck2, Sparkles, Users } from "lucide-react";

const stats = [
  { label: "Tin đang tuyển", value: "12", color: "text-(--primary-blue)" },
  { label: "Ứng viên mới", value: "34", color: "text-(--accent-green)" },
  { label: "Lịch phỏng vấn", value: "8", color: "text-(--accent-orange)" },
  { label: "Tỉ lệ phản hồi", value: "72%", color: "text-(--accent-purple)" },
];

const quickActions = [
  {
    title: "Đăng tin tuyển dụng",
    href: "/recruiter/post-job",
    desc: "Tạo JD và mở đơn ứng tuyển mới",
    icon: FileCheck2,
  },
  {
    title: "Quản lý ứng viên",
    href: "/recruiter/applications",
    desc: "Lọc hồ sơ và cập nhật trạng thái",
    icon: Users,
  },
  {
    title: "Lịch phỏng vấn",
    href: "/recruiter/interviews",
    desc: "Theo dõi lịch và người phỏng vấn",
    icon: CalendarClock,
  },
  {
    title: "AI Candidate Finder",
    href: "/recruiter/analytics",
    desc: "Xem gợi ý ứng viên tiềm năng",
    icon: Sparkles,
  },
];

export default function RecruiterDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-(--primary-blue) via-(--blue-dark) to-(--accent-purple) px-6 py-7 text-white">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold text-white/75">Recruiter Workspace</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Bảng điều khiển tuyển dụng</h1>
          <p className="mt-2 text-sm text-white/85 sm:text-base">
            Theo dõi hiệu suất tuyển dụng theo thời gian thực, tối ưu pipeline ứng viên và lên lịch phỏng vấn chỉ trong vài bước.
          </p>
        </div>
        <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/10" />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">{item.label}</p>
            <p className={`mt-2 text-2xl font-black ${item.color}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-(--gray-900)">Thao tác nhanh</h2>
          <Link href="/recruiter/manage-jobs" className="text-sm font-semibold text-(--primary-blue) hover:underline">
            Xem tất cả tin tuyển dụng
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ title, href, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm transition-all hover:border-(--primary-blue)/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--blue-light) text-(--primary-blue)">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-bold text-(--gray-900) group-hover:text-(--primary-blue)">{title}</p>
              <p className="mt-1 text-xs text-(--gray-500)">{desc}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-(--primary-blue)">
                Mở ngay <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

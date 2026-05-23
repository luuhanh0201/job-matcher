import { BarChart3, Sparkles, Target, TrendingUp } from "lucide-react";

const insights = [
  {
    title: "Ứng viên phù hợp cao",
    value: "27",
    desc: "AI score > 85% trong 30 ngày gần nhất",
    icon: Target,
  },
  {
    title: "Nguồn ứng viên hiệu quả",
    value: "LinkedIn",
    desc: "Tỉ lệ mời phỏng vấn cao nhất",
    icon: TrendingUp,
  },
  {
    title: "Thời gian tuyển trung bình",
    value: "17 ngày",
    desc: "Giảm 3 ngày so với tháng trước",
    icon: BarChart3,
  },
];

export default function RecruiterAnalyticsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">AI Candidate Finder</h1>
        <p className="mt-1 text-sm text-(--gray-500)">
          Phân tích dữ liệu ứng viên, gợi ý nguồn tuyển phù hợp và dự báo hiệu suất chiến dịch.
        </p>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-linear-to-r from-(--blue-light) to-white p-5 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-(--accent-purple)">
          <Sparkles className="h-4 w-4" />
          AI Insight
        </div>
        <p className="mt-3 text-sm text-(--gray-700)">
          Gợi ý tuần này: ưu tiên ứng viên có 2+ năm kinh nghiệm React và từng làm sản phẩm SaaS để tăng tỉ lệ pass vòng phỏng vấn kỹ thuật.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {insights.map(({ title, value, desc, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--blue-light) text-(--primary-blue)">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-(--gray-500)">{title}</p>
            <p className="mt-1 text-xl font-black text-(--gray-900)">{value}</p>
            <p className="mt-1 text-xs text-(--gray-500)">{desc}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-(--gray-300) bg-white p-5">
        <p className="text-sm font-semibold text-(--gray-700)">Biểu đồ hiệu suất (placeholder)</p>
        <div className="mt-4 grid h-44 grid-cols-7 items-end gap-2">
          {[45, 60, 52, 80, 68, 74, 90].map((height, index) => (
            <div key={index} className="rounded-md bg-(--primary-blue)/80" style={{ height: `${height}%` }} />
          ))}
        </div>
      </section>
    </div>
  );
}

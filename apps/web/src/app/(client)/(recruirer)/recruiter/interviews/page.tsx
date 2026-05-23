import { CalendarRange, Clock3, Video } from "lucide-react";

const interviews = [
  {
    candidate: "Nguyễn Hoàng Minh",
    role: "Frontend Developer",
    time: "09:00 - 09:45",
    date: "24/05/2026",
    interviewer: "Trưởng nhóm FE",
  },
  {
    candidate: "Lê Thảo Vy",
    role: "Frontend Developer",
    time: "14:30 - 15:15",
    date: "24/05/2026",
    interviewer: "Engineering Manager",
  },
  {
    candidate: "Phạm Quốc Bảo",
    role: "QA Engineer",
    time: "10:15 - 11:00",
    date: "25/05/2026",
    interviewer: "QA Lead",
  },
];

export default function RecruiterInterviewsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">Lịch phỏng vấn</h1>
        <p className="mt-1 text-sm text-(--gray-500)">Quản lý lịch hẹn với ứng viên và điều phối người phỏng vấn.</p>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Hôm nay</p>
          <p className="mt-2 text-2xl font-black text-(--gray-900)">2 buổi</p>
        </article>
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Tuần này</p>
          <p className="mt-2 text-2xl font-black text-(--primary-blue)">8 buổi</p>
        </article>
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Tỉ lệ tham gia</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">93%</p>
        </article>
      </section>

      <section className="space-y-3">
        {interviews.map((item) => (
          <article key={`${item.candidate}-${item.date}-${item.time}`} className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-(--gray-900)">{item.candidate}</p>
                <p className="text-xs text-(--gray-500)">{item.role}</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-(--blue-light) px-2.5 py-1 text-xs font-semibold text-(--primary-blue)">
                <CalendarRange className="h-4 w-4" />
                {item.date}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-(--gray-600)">
              <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {item.time}</span>
              <span>Người phỏng vấn: {item.interviewer}</span>
            </div>

            <button className="mt-3 inline-flex items-center gap-1 rounded-lg border border-(--gray-200) px-3 py-1.5 text-xs font-semibold text-(--gray-700) hover:bg-(--gray-100)">
              <Video className="h-4 w-4" />
              Mở phòng họp
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

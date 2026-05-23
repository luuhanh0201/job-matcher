import { CalendarCheck2, Mail, Phone, Search } from "lucide-react";

const candidates = [
  { name: "Đỗ Hồng Phúc", title: "Frontend Developer", exp: "3 năm", email: "phuc@example.com" },
  { name: "Nguyễn Thu An", title: "QA Engineer", exp: "2 năm", email: "thuan@example.com" },
  { name: "Lê Minh Triết", title: "Product Designer", exp: "4 năm", email: "triet@example.com" },
];

export default function RecruiterCandidatesPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">Danh sách ứng viên</h1>
        <p className="mt-1 text-sm text-(--gray-500)">Kho ứng viên đã lưu và ứng viên được AI đề xuất cho công ty bạn.</p>
      </header>

      <section className="relative rounded-2xl border border-(--gray-200) bg-white p-3 shadow-sm">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
        <input
          type="search"
          placeholder="Tìm ứng viên theo tên, kỹ năng, email..."
          className="h-11 w-full rounded-xl bg-(--gray-100) pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-(--primary-blue)/30"
        />
      </section>

      <section className="grid grid-cols-1 gap-3">
        {candidates.map((candidate) => (
          <article key={candidate.email} className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-(--gray-900)">{candidate.name}</p>
                <p className="text-xs text-(--gray-500)">{candidate.title}</p>
              </div>
              <span className="rounded-full bg-(--gray-100) px-2.5 py-1 text-xs font-semibold text-(--gray-600)">
                Kinh nghiệm: {candidate.exp}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-(--gray-600)">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-4 w-4" /> {candidate.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-4 w-4" /> 09xx xxx xxx
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1 rounded-lg bg-(--blue-light) px-3 py-1.5 text-xs font-bold text-(--primary-blue) hover:brightness-95">
                <CalendarCheck2 className="h-4 w-4" /> Đặt lịch phỏng vấn
              </button>
              <button className="rounded-lg border border-(--gray-200) px-3 py-1.5 text-xs font-semibold text-(--gray-700) hover:bg-(--gray-100)">
                Xem CV
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

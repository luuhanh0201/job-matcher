import { CircleCheckBig, Clock3, Filter, XCircle } from "lucide-react";

const applicants = [
  { name: "Nguyễn Hoàng Minh", role: "Frontend Developer", score: "92", status: "Đề xuất phỏng vấn" },
  { name: "Lê Thảo Vy", role: "Frontend Developer", score: "88", status: "Đang đánh giá" },
  { name: "Phạm Quốc Bảo", role: "QA Engineer", score: "81", status: "Mới nộp" },
  { name: "Trần Gia Hân", role: "Product Designer", score: "76", status: "Không phù hợp" },
];

export default function RecruiterApplicationsPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-(--gray-900)">Quản lý ứng viên</h1>
          <p className="mt-1 text-sm text-(--gray-500)">
            Sắp xếp và cập nhật trạng thái ứng viên theo pipeline tuyển dụng.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-(--gray-200) bg-white px-3 py-2 text-sm font-semibold text-(--gray-700) hover:bg-(--gray-100)">
          <Filter className="h-4 w-4" />
          Bộ lọc nâng cao
        </button>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Mới nộp</p>
          <p className="mt-2 text-2xl font-black text-(--gray-900)">15</p>
        </article>
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Đề xuất phỏng vấn</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">7</p>
        </article>
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Không phù hợp</p>
          <p className="mt-2 text-2xl font-black text-red-500">4</p>
        </article>
      </section>

      <section className="space-y-3">
        {applicants.map((candidate) => (
          <article
            key={`${candidate.name}-${candidate.role}`}
            className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-(--gray-900)">{candidate.name}</p>
                <p className="text-xs text-(--gray-500)">{candidate.role}</p>
              </div>
              <div className="rounded-full bg-(--blue-light) px-2.5 py-1 text-xs font-bold text-(--primary-blue)">
                AI Match {candidate.score}%
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200">
                <CircleCheckBig className="h-4 w-4" />
                Mời phỏng vấn
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-200">
                <Clock3 className="h-4 w-4" />
                Chờ thêm thông tin
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200">
                <XCircle className="h-4 w-4" />
                Từ chối
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

import { CalendarDays, Eye, MoreHorizontal, Users } from "lucide-react";

const jobs = [
  { title: "Frontend Developer", status: "OPEN", applicants: 24, expires: "30/06/2026" },
  { title: "QA Engineer", status: "OPEN", applicants: 12, expires: "01/07/2026" },
  { title: "Product Designer", status: "DRAFT", applicants: 0, expires: "--" },
  { title: "HR Executive", status: "CLOSED", applicants: 41, expires: "12/05/2026" },
];

function getStatusClass(status: string) {
  if (status === "OPEN") return "bg-emerald-100 text-emerald-700";
  if (status === "DRAFT") return "bg-amber-100 text-amber-700";
  return "bg-gray-200 text-gray-700";
}

export default function RecruiterManageJobsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-(--gray-900)">Quản lý tin tuyển dụng</h1>
        <p className="mt-1 text-sm text-(--gray-500)">
          Theo dõi tình trạng đăng tuyển, số lượng ứng viên và hạn nộp của từng vị trí.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-(--gray-200) bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-(--gray-100) text-left text-(--gray-600)">
              <tr>
                <th className="px-4 py-3 font-semibold">Vị trí</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ứng viên</th>
                <th className="px-4 py-3 font-semibold">Hạn nộp</th>
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.title} className="border-t border-(--gray-200)">
                  <td className="px-4 py-3 font-semibold text-(--gray-900)">{job.title}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${getStatusClass(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--gray-600)">{job.applicants}</td>
                  <td className="px-4 py-3 text-(--gray-600)">{job.expires}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-(--gray-500)">
                      <button className="rounded-lg p-1.5 hover:bg-(--gray-100)" aria-label="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 hover:bg-(--gray-100)" aria-label="Xem ứng viên">
                        <Users className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 hover:bg-(--gray-100)" aria-label="Tùy chọn khác">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Tin cần gia hạn</p>
          <p className="mt-2 text-sm font-bold text-(--gray-900)">2 vị trí sắp hết hạn trong 7 ngày</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-(--gray-500)">
            <CalendarDays className="h-4 w-4" />
            Đề xuất gia hạn để không mất ứng viên phù hợp
          </div>
        </article>
        <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">Hiệu suất</p>
          <p className="mt-2 text-sm font-bold text-(--gray-900)">Tỉ lệ chuyển đổi CV sang phỏng vấn: 28%</p>
          <p className="mt-3 text-xs text-(--gray-500)">Gợi ý tăng tốc: lọc hồ sơ theo kỹ năng bắt buộc và điểm AI Match.</p>
        </article>
      </section>
    </div>
  );
}

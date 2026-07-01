"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Save,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getJobPostById, updateJobPostStatus } from "@/services/job.service";
import {
  SENIORITY_LEVEL_LABEL,
  type JobPostProfile,
  type JobPostStatus,
} from "@/types/job";

const STATUS_LABEL: Record<JobPostStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
};

function getStatusClass(status: JobPostStatus) {
  if (status === "OPEN") return "bg-emerald-100 text-emerald-700";
  if (status === "DRAFT") return "bg-amber-100 text-amber-700";
  return "bg-gray-200 text-gray-700";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSalary(job: JobPostProfile) {
  if (job.salaryType === "NEGOTIABLE") return "Thỏa thuận";

  const formatNumber = (value?: number | null) =>
    typeof value === "number"
      ? new Intl.NumberFormat("vi-VN").format(value)
      : "--";

  if (job.salaryType === "FIXED") {
    return `${formatNumber(job.salaryMin)} ${job.currency}`;
  }

  return `${formatNumber(job.salaryMin)} - ${formatNumber(job.salaryMax)} ${job.currency}`;
}

function formatLocation(job: JobPostProfile) {
  return [
    job.location?.address,
    job.location?.wardName,
    job.location?.provinceName,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function RecruiterJobPostDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    getJobPostById(params.id)
      .then((item) => setJob(item))
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải chi tiết tin tuyển dụng",
        );
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const handleStatusChange = async (status: JobPostStatus) => {
    if (!job || status === job.status) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updatedJob = await updateJobPostStatus(job.id, status);
      setJob(updatedJob);
      toast.success("Đã cập nhật trạng thái tin tuyển dụng");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái tin tuyển dụng",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-(--gray-500)" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-(--gray-200) bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold text-(--gray-700)">
          Không tìm thấy tin tuyển dụng
        </p>
        <Link
          href="/recruiter/manage-jobs"
          className="mt-3 inline-flex text-sm font-bold text-(--primary-blue)"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
        <Link
          href="/recruiter/manage-jobs"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-(--primary-blue) hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-(--gray-900)">
                {job.title}
              </h1>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(job.status)}`}
              >
                {STATUS_LABEL[job.status]}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-(--gray-500)">
              {job.company?.name || "Chưa cập nhật công ty"} · {job.department}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/recruiter/manage-jobs/${job.id}/applications`}>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-xl px-4 font-bold"
              >
                <UserRoundSearch className="h-4 w-4" />
                Xem ứng viên
              </Button>
            </Link>
            <Link href={`/recruiter/manage-jobs/${job.id}/edit`}>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-xl px-4 font-bold"
              >
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            </Link>
            <Link href="/recruiter/post-job">
              <Button className="h-10 rounded-xl bg-(--primary-blue) px-4 font-bold text-white hover:bg-(--blue-dark)">
                Đăng tin mới
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={Building2} label="Công ty" value={job.company?.name || "--"} />
        <InfoCard icon={MapPin} label="Địa điểm" value={formatLocation(job) || "--"} />
        <InfoCard icon={CircleDollarSign} label="Lương" value={formatSalary(job)} />
        <InfoCard icon={CalendarClock} label="Hạn ứng tuyển" value={formatDate(job.expiredAt)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <ContentSection title="Mô tả công việc" icon={FileText} content={job.description} />
          <ContentSection title="Yêu cầu" icon={BriefcaseBusiness} content={job.requirements} />
          <ContentSection title="Trách nhiệm" icon={Users} content={job.responsibilities} />
          <ContentSection title="Phúc lợi" icon={CircleDollarSign} content={job.benefits} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-black text-(--gray-900)">
              <Save className="h-5 w-5 text-(--primary-blue)" />
              Cập nhật trạng thái
            </h2>
            <div className="mt-4 space-y-3">
              <select
                value={job.status}
                disabled={isUpdatingStatus}
                onChange={(event) =>
                  handleStatusChange(event.target.value as JobPostStatus)
                }
                className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-bold text-(--gray-900) outline-none disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="DRAFT">Nháp</option>
                <option value="OPEN">Đang tuyển</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
              <p className="text-xs font-medium text-(--gray-500)">
                Trạng thái chỉ được thay đổi trong trang chi tiết tin tuyển dụng.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-(--gray-900)">
              Thông tin tuyển dụng
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <DetailRow label="Loại công việc" value={job.jobType} />
              <DetailRow label="Hình thức" value={job.workMode} />
              <DetailRow
                label="Cấp bậc"
                value={SENIORITY_LEVEL_LABEL[job.seniorityLevel]}
              />
              <DetailRow label="Số lượng" value={job.quantity?.toString() || "--"} />
              <DetailRow label="Ngày đăng" value={formatDate(job.publishedAt)} />
              <DetailRow label="Ngày tạo" value={formatDate(job.createdAt)} />
            </div>
          </section>

          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-(--gray-900)">Kỹ năng</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-(--blue-light) px-3 py-1 text-xs font-bold text-(--primary-blue)"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm font-medium text-(--gray-500)">
                  Chưa cập nhật kỹ năng
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--blue-light) text-(--primary-blue)">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase text-(--gray-500)">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-(--gray-900)">{value}</p>
    </article>
  );
}

function ContentSection({
  title,
  icon: Icon,
  content,
}: {
  title: string;
  icon: React.ElementType;
  content?: string | null;
}) {
  return (
    <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-black text-(--gray-900)">
        <Icon className="h-5 w-5 text-(--primary-blue)" />
        {title}
      </h2>
      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-(--gray-700)">
        {content || "Chưa cập nhật"}
      </p>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-(--gray-200) pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium text-(--gray-500)">{label}</span>
      <span className="text-right font-bold text-(--gray-900)">{value}</span>
    </div>
  );
}

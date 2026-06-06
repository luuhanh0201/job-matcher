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
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyToJob } from "@/services/job-application.service";
import { getPublicJobPostById } from "@/services/job.service";
import { SENIORITY_LEVEL_LABEL, type JobPostProfile } from "@/types/job";

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
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

export default function CandidateJobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [hasLogoError, setHasLogoError] = useState(false);

  useEffect(() => {
    getPublicJobPostById(params.id)
      .then((item) => setJob(item))
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải chi tiết việc làm",
        );
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const handleApplyJob = async () => {
    if (!job || isApplying || hasApplied) {
      return;
    }

    setIsApplying(true);
    try {
      await applyToJob(job.id);
      setHasApplied(true);
      toast.success("Ứng tuyển thành công");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể ứng tuyển tin này",
      );
    } finally {
      setIsApplying(false);
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
          Không tìm thấy việc làm
        </p>
        <Link
          href="/jobs"
          className="mt-3 inline-flex text-sm font-bold text-(--primary-blue)"
        >
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
        <Link
          href="/jobs"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-(--primary-blue) hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--blue-light) text-(--primary-blue)">
              {job.company?.logoUrl && !hasLogoError ? (
                // Logo URLs can come from user uploads/external hosts, so avoid next/image host restrictions here.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company.logoUrl}
                  alt={`${job.company.name} logo`}
                  className="h-full w-full object-contain p-1"
                  onError={() => setHasLogoError(true)}
                />
              ) : (
                <Building2 className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-(--gray-900)">
                {job.title}
              </h1>
              <p className="mt-1 text-sm font-bold text-(--gray-600)">
                {job.company?.name || "Chưa cập nhật công ty"}
              </p>
              <p className="mt-2 text-sm text-(--gray-500)">
                {formatLocation(job) || "Chưa cập nhật địa điểm"}
              </p>
            </div>
          </div>

          <Button
            disabled={isApplying || hasApplied}
            onClick={handleApplyJob}
            className="h-11 gap-2 rounded-xl bg-(--primary-blue) px-5 font-bold text-white hover:bg-(--blue-dark) disabled:opacity-70"
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {hasApplied ? "Đã ứng tuyển" : "Ứng tuyển"}
          </Button>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={CircleDollarSign} label="Lương" value={formatSalary(job)} />
        <InfoCard icon={BriefcaseBusiness} label="Loại việc" value={job.jobType} />
        <InfoCard
          icon={Users}
          label="Cấp bậc"
          value={SENIORITY_LEVEL_LABEL[job.seniorityLevel]}
        />
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
            <h2 className="text-base font-black text-(--gray-900)">
              Thông tin nhanh
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <DetailRow label="Công ty" value={job.company?.name || "--"} />
              <DetailRow label="Phòng ban" value={job.department} />
              <DetailRow label="Hình thức" value={job.workMode} />
              <DetailRow label="Số lượng" value={job.quantity?.toString() || "--"} />
              <DetailRow label="Ngày đăng" value={formatDate(job.publishedAt)} />
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

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Loader2,
  Plus,
  Search,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJobPosts } from "@/services/job.service";
import type { JobPostProfile, JobPostStatus } from "@/types/job";

const STATUS_LABEL: Record<JobPostStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
};

function getStatusClass(status: JobPostStatus) {
  if (status === "OPEN") return "bg-success/15 text-success";
  if (status === "DRAFT") return "bg-warning/15 text-warning";
  return "bg-muted text-muted-foreground";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function formatSalary(job: JobPostProfile) {
  if (job.salaryType === "NEGOTIABLE") {
    return "Thỏa thuận";
  }

  const formatNumber = (value?: number | null) =>
    typeof value === "number"
      ? new Intl.NumberFormat("vi-VN").format(value)
      : "--";

  if (job.salaryType === "FIXED") {
    return `${formatNumber(job.salaryMin)} ${job.currency}`;
  }

  return `${formatNumber(job.salaryMin)} - ${formatNumber(job.salaryMax)} ${job.currency}`;
}

export default function RecruiterManageJobsPage() {
  const [jobs, setJobs] = useState<JobPostProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getJobPosts()
      .then((items) => setJobs(items))
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách tin tuyển dụng",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return jobs;

    return jobs.filter((job) =>
      [job.title, job.department, job.company?.name, job.status]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }, [jobs, searchTerm]);

  const expiringSoonCount = jobs.filter((job) => {
    if (!job.expiredAt || job.status !== "OPEN") return false;
    const diffDays =
      (new Date(job.expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Quản lý tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi trạng thái đăng tuyển và hạn nộp của từng vị trí.
          </p>
        </div>
        <Link href="/recruiter/post-job">
          <Button className="h-10 gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Đăng tin
          </Button>
        </Link>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo vị trí, phòng ban, công ty..."
            className="h-11 rounded-xl border-border bg-muted/50 pl-10"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-muted-foreground">
            <SearchX className="h-10 w-10 opacity-50" />
            <p className="text-sm font-bold">Chưa có tin tuyển dụng phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vị trí</th>
                  <th className="px-4 py-3 font-semibold">Công ty</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Lương</th>
                  <th className="px-4 py-3 font-semibold">Hạn nộp</th>
                  <th className="px-4 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{job.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {job.department}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      {job.company?.name || "Chưa cập nhật"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${getStatusClass(job.status)}`}
                      >
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      {formatSalary(job)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(job.expiredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/recruiter/manage-jobs/${job.id}`}>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 gap-2 rounded-xl font-bold"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Tin cần gia hạn
          </p>
          <p className="mt-2 text-sm font-bold text-foreground">
            {expiringSoonCount} vị trí sắp hết hạn trong 7 ngày
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Theo dõi hạn nộp để không bỏ lỡ ứng viên phù hợp
          </div>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Tổng tin tuyển dụng
          </p>
          <p className="mt-2 text-sm font-bold text-foreground">
            {jobs.length} tin trong hệ thống
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Bao gồm tin nháp, đang tuyển và đã đóng.
          </p>
        </article>
      </section>
    </div>
  );
}

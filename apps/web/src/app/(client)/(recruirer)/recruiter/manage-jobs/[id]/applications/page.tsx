"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  Download,
  FileText,
  Loader2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getJobApplications } from "@/services/job-application.service";
import {
  JOB_APPLICATION_STATUS_LABEL,
  type JobApplicationProfile,
  type JobApplicationStatus,
} from "@/types/job-application";

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: JobApplicationStatus) {
  if (status === "SHORTLISTED" || status === "HIRED") {
    return "bg-success/15 text-success";
  }
  if (status === "REJECTED") {
    return "bg-destructive/15 text-destructive";
  }
  if (status === "INTERVIEW") {
    return "bg-primary/15 text-primary";
  }
  if (status === "VIEWED") {
    return "bg-accent/15 text-accent";
  }
  return "bg-warning/15 text-warning";
}

export default function RecruiterJobApplicationsPage() {
  const params = useParams<{ id: string }>();
  const [applications, setApplications] = useState<JobApplicationProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getJobApplications(params.id)
      .then((items) => setApplications(items))
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách ứng viên",
        );
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const job = useMemo(() => applications[0]?.job, [applications]);

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Link
          href={`/recruiter/manage-jobs/${params.id}`}
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại chi tiết tin
        </Link>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Danh sách ứng viên
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {job
                ? `${job.title} · ${job.company?.name || "Chưa cập nhật công ty"}`
                : "Tin tuyển dụng này chưa có ứng viên"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Tổng ứng viên
            </p>
            <p className="mt-1 text-xl font-black text-foreground">
              {applications.length}
            </p>
          </div>
        </div>
      </header>

      {applications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-black text-foreground">
            Chưa có ứng viên
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Khi ứng viên ứng tuyển, hồ sơ sẽ hiển thị tại đây theo từng tin.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                    {application.candidate.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={application.candidate.avatar}
                        alt={application.candidate.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-7 w-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-black text-foreground">
                        {application.candidate.fullName}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(application.status)}`}
                      >
                        {JOB_APPLICATION_STATUS_LABEL[application.status]}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                      <InfoLine
                        icon={Mail}
                        value={application.candidate.email}
                      />
                      <InfoLine
                        icon={Phone}
                        value={application.candidate.phone || "Chưa cập nhật"}
                      />
                      <InfoLine
                        icon={BriefcaseBusiness}
                        value={application.job.title}
                      />
                      <InfoLine
                        icon={CalendarClock}
                        value={formatDate(application.createdAt)}
                      />
                    </div>
                  </div>
                </div>

                {application.cv ? (
                  <a
                    href={application.cv.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full gap-2 rounded-xl font-bold lg:w-auto"
                    >
                      <Download className="h-4 w-4" />
                      Xem CV
                    </Button>
                  </a>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-bold text-muted-foreground">
                    Chưa đính kèm CV
                  </div>
                )}
              </div>

              {application.coverLetter ? (
                <div className="mt-4 rounded-xl bg-muted/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Thư ứng tuyển
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
                    {application.coverLetter}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function InfoLine({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium">{value}</span>
    </span>
  );
}

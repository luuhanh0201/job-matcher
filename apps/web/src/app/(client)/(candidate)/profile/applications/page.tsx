"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  Loader2,
  MapPin,
  StickyNote,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getJobApplicationStatusLogs,
  getMyApplications,
} from "@/services/job-application.service";
import { getMyInterviews, respondInterview } from "@/services/interview.service";
import {
  JOB_APPLICATION_STATUS_LABEL,
  type JobApplicationProfile,
  type JobApplicationStatus,
  type JobApplicationStatusLog,
} from "@/types/job-application";
import {
  INTERVIEW_STATUS_LABEL,
  type InterviewProfile,
  type InterviewStatus,
} from "@/types/interview";

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInterviewStatusClass(status: InterviewStatus) {
  if (status === "ACCEPTED") return "bg-success/15 text-success";
  if (status === "DECLINED") return "bg-destructive/15 text-destructive";
  if (status === "CANCELLED") return "bg-muted text-muted-foreground";
  return "bg-warning/15 text-warning";
}

function getApplicationStatusClass(status: JobApplicationStatus) {
  if (status === "SHORTLISTED" || status === "HIRED") {
    return "bg-success/15 text-success";
  }
  if (status === "REJECTED") return "bg-destructive/15 text-destructive";
  if (status === "INTERVIEW") return "bg-primary/15 text-primary";
  if (status === "VIEWED") return "bg-accent/15 text-accent";
  return "bg-warning/15 text-warning";
}

function isInterviewExpired(interview: InterviewProfile) {
  return new Date(interview.scheduledAt) <= new Date();
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<JobApplicationProfile[]>([]);
  const [interviews, setInterviews] = useState<InterviewProfile[]>([]);
  const [statusLogsByApplicationId, setStatusLogsByApplicationId] = useState<
    Record<string, JobApplicationStatusLog[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [respondingInterviewId, setRespondingInterviewId] = useState("");

  useEffect(() => {
    Promise.all([getMyApplications(), getMyInterviews()])
      .then(([applicationItems, interviewItems]) => {
        setApplications(applicationItems);
        setInterviews(interviewItems);
        void loadStatusLogs(applicationItems.map((item) => item.id));
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách việc đã ứng tuyển",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loadStatusLogs = async (applicationIds: string[]) => {
    try {
      const logsEntries = await Promise.all(
        applicationIds.map(async (applicationId) => [
          applicationId,
          await getJobApplicationStatusLogs(applicationId),
        ] as const),
      );
      setStatusLogsByApplicationId((prev) => ({
        ...prev,
        ...Object.fromEntries(logsEntries),
      }));
    } catch {
      toast.error("Không thể tải lịch sử trạng thái hồ sơ");
    }
  };

  const interviewsByApplicationId = useMemo(() => {
    return interviews.reduce<Record<string, InterviewProfile[]>>(
      (result, interview) => {
        const applicationInterviews = result[interview.applicationId] ?? [];
        applicationInterviews.push(interview);
        result[interview.applicationId] = applicationInterviews;
        return result;
      },
      {},
    );
  }, [interviews]);

  const handleRespondInterview = async (
    interview: InterviewProfile,
    status: Extract<InterviewStatus, "ACCEPTED" | "DECLINED">,
  ) => {
    if (isInterviewExpired(interview)) {
      toast.error("Lịch phỏng vấn đã quá hạn xác nhận");
      return;
    }

    setRespondingInterviewId(interview.id);
    try {
      const updatedInterview = await respondInterview(interview.id, status);
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === updatedInterview.id ? updatedInterview : item,
        ),
      );
      toast.success("Đã phản hồi lịch phỏng vấn");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể phản hồi lịch phỏng vấn",
      );
    } finally {
      setRespondingInterviewId("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-foreground">
          Việc đã ứng tuyển
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi trạng thái hồ sơ và xác nhận lịch phỏng vấn.
        </p>
      </header>

      {applications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <BriefcaseBusiness className="mx-auto h-9 w-9 text-primary" />
          <p className="mt-3 text-sm font-bold text-foreground">
            Bạn chưa ứng tuyển công việc nào
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {applications.map((application) => {
            const applicationInterviews =
              interviewsByApplicationId[application.id] ?? [];

            return (
              <article
                key={application.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-black text-foreground">
                        {application.job.title}
                      </h2>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {JOB_APPLICATION_STATUS_LABEL[application.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-muted-foreground">
                      {application.job.company?.name || "Chưa cập nhật công ty"}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      Ứng tuyển: {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>

                {applicationInterviews.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {applicationInterviews.map((interview) => {
                      const isExpired = isInterviewExpired(interview);
                      const canRespond =
                        interview.status === "PENDING" && !isExpired;

                      return (
                        <div
                          key={interview.id}
                          className="rounded-xl border border-border bg-muted/50 p-4"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-black text-foreground">
                                  Lịch phỏng vấn
                                </p>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${getInterviewStatusClass(interview.status)}`}
                                >
                                  {INTERVIEW_STATUS_LABEL[interview.status]}
                                </span>
                                {isExpired && interview.status === "PENDING" ? (
                                  <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
                                    Quá hạn xác nhận
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-3 grid gap-2 md:grid-cols-2">
                                <InterviewInfoBlock
                                  icon={Clock3}
                                  label="Thời gian"
                                  value={`${formatDate(interview.scheduledAt)} · ${interview.durationMinutes} phút`}
                                />
                                <InterviewInfoBlock
                                  icon={MapPin}
                                  label="Địa điểm"
                                  value={interview.location || "Chưa cập nhật"}
                                />
                                <InterviewInfoBlock
                                  icon={Video}
                                  label="Link phỏng vấn"
                                  value={
                                    interview.meetingUrl
                                      ? "Mở phòng phỏng vấn"
                                      : "Chưa cập nhật"
                                  }
                                  href={interview.meetingUrl || undefined}
                                />
                              </div>

                              {interview.note ? (
                                <div className="mt-3 flex gap-2 rounded-xl bg-card/70 p-3 text-sm text-foreground">
                                  <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  <p className="whitespace-pre-line">
                                    {interview.note}
                                  </p>
                                </div>
                              ) : null}
                            </div>

                            {canRespond ? (
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                  type="button"
                                  disabled={respondingInterviewId === interview.id}
                                  onClick={() =>
                                    handleRespondInterview(interview, "ACCEPTED")
                                  }
                                  className="h-10 gap-2 rounded-xl bg-success px-4 font-bold text-success-foreground hover:bg-success/90"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Xác nhận
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={respondingInterviewId === interview.id}
                                  onClick={() =>
                                    handleRespondInterview(interview, "DECLINED")
                                  }
                                  className="h-10 gap-2 rounded-xl font-bold text-destructive"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Từ chối
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <StatusHistory
                  logs={statusLogsByApplicationId[application.id] ?? []}
                />
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function StatusHistory({ logs }: { logs: JobApplicationStatusLog[] }) {
  return (
    <section className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-foreground">
        <ClipboardList className="h-4 w-4 text-primary" />
        Lịch sử trạng thái
      </div>

      {logs.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Chưa có lịch sử thay đổi.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {log.content}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {formatDate(log.createdAt)} ·{" "}
                  {log.changedBy?.fullName || "Không xác định"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  {log.fromStatus ? (
                    <>
                      <span
                        className={`rounded-full px-2 py-0.5 ${getApplicationStatusClass(log.fromStatus)}`}
                      >
                        {JOB_APPLICATION_STATUS_LABEL[log.fromStatus]}
                      </span>
                      <span className="text-muted-foreground">→</span>
                    </>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 ${getApplicationStatusClass(log.toStatus)}`}
                  >
                    {JOB_APPLICATION_STATUS_LABEL[log.toStatus]}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function InterviewInfoBlock({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-bold text-foreground">
          {value}
        </span>
      </span>
      {href ? (
        <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 hover:bg-primary/10/60"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2">
      {content}
    </div>
  );
}

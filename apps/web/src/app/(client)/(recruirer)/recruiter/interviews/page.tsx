"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarRange,
  CalendarX,
  Clock3,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Search,
  StickyNote,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelInterview,
  getRecruiterInterviews,
  updateInterview,
} from "@/services/interview.service";
import {
  INTERVIEW_STATUS_LABEL,
  type InterviewProfile,
  type InterviewStatus,
} from "@/types/interview";

type InterviewFormState = {
  scheduledAt: string;
  durationMinutes: string;
  meetingUrl: string;
  location: string;
  note: string;
};

function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocalValue(value: Date) {
  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

const PAGE_SIZE = 10;

function getInterviewFormState(interview: InterviewProfile): InterviewFormState {
  return {
    scheduledAt: toDateTimeLocalValue(new Date(interview.scheduledAt)),
    durationMinutes: String(interview.durationMinutes),
    meetingUrl: interview.meetingUrl ?? "",
    location: interview.location ?? "",
    note: interview.note ?? "",
  };
}

function isInterviewExpired(interview: InterviewProfile) {
  return new Date(interview.scheduledAt) <= new Date();
}

function getStatusClass(status: InterviewStatus) {
  if (status === "ACCEPTED") return "bg-success/15 text-success";
  if (status === "DECLINED") return "bg-destructive/15 text-destructive";
  if (status === "CANCELLED") return "bg-muted text-muted-foreground";
  return "bg-warning/15 text-warning";
}

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInterview, setEditingInterview] =
    useState<InterviewProfile | null>(null);
  const [interviewForm, setInterviewForm] = useState<InterviewFormState>({
    scheduledAt: "",
    durationMinutes: "60",
    meetingUrl: "",
    location: "",
    note: "",
  });
  const [isUpdatingInterview, setIsUpdatingInterview] = useState(false);
  const [cancellingInterviewId, setCancellingInterviewId] = useState("");

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchInterviews = useCallback(
    (pageNumber: number) => {
      setIsLoading(true);
      getRecruiterInterviews({
        keyword: keyword || undefined,
        status: (statusFilter || undefined) as InterviewStatus | undefined,
        page: pageNumber,
        limit: PAGE_SIZE,
      })
        .then((result) => {
          setInterviews(result.items);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        })
        .catch((error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Không thể tải lịch phỏng vấn",
          );
        })
        .finally(() => setIsLoading(false));
    },
    [keyword, statusFilter],
  );

  useEffect(() => {
    fetchInterviews(1);
  }, [fetchInterviews]);

  const loadStats = useCallback(() => {
    // Đếm theo trạng thái trên toàn bộ dữ liệu (limit=1 chỉ lấy total)
    Promise.all([
      getRecruiterInterviews({ limit: 1 }),
      getRecruiterInterviews({ limit: 1, status: "PENDING" }),
      getRecruiterInterviews({ limit: 1, status: "ACCEPTED" }),
      getRecruiterInterviews({ limit: 1, status: "CANCELLED" }),
    ])
      .then(([all, pending, accepted, cancelled]) =>
        setStats({
          total: all.total,
          pending: pending.total,
          accepted: accepted.total,
          cancelled: cancelled.total,
        }),
      )
      .catch(() => {
        // Bỏ qua: các thẻ thống kê không chặn luồng chính
      });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const openEditModal = (interview: InterviewProfile) => {
    if (interview.status === "CANCELLED") {
      toast.error("Không thể sửa lịch phỏng vấn đã hủy");
      return;
    }
    if (isInterviewExpired(interview)) {
      toast.error("Không thể sửa lịch phỏng vấn đã quá hạn");
      return;
    }
    setInterviewForm(getInterviewFormState(interview));
    setEditingInterview(interview);
  };

  const handleUpdateInterview = async () => {
    if (!editingInterview) return;
    if (!interviewForm.scheduledAt) {
      toast.error("Vui lòng chọn thời gian phỏng vấn");
      return;
    }
    if (new Date(interviewForm.scheduledAt) <= new Date()) {
      toast.error("Thời gian phỏng vấn phải ở tương lai");
      return;
    }

    setIsUpdatingInterview(true);
    try {
      const updatedInterview = await updateInterview(editingInterview.id, {
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes || 60),
        meetingUrl: interviewForm.meetingUrl,
        location: interviewForm.location,
        note: interviewForm.note,
      });
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === updatedInterview.id ? updatedInterview : item,
        ),
      );
      setEditingInterview(null);
      toast.success("Đã cập nhật lịch phỏng vấn và gửi mail cho ứng viên");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật lịch",
      );
    } finally {
      setIsUpdatingInterview(false);
    }
  };

  const handleCancelInterview = async (interview: InterviewProfile) => {
    if (interview.status === "CANCELLED") return;
    const confirmed = window.confirm(
      `Hủy lịch phỏng vấn với ${interview.candidate.fullName}?`,
    );
    if (!confirmed) return;

    setCancellingInterviewId(interview.id);
    try {
      const updatedInterview = await cancelInterview(interview.id);
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === updatedInterview.id ? updatedInterview : item,
        ),
      );
      loadStats();
      toast.success("Đã hủy lịch phỏng vấn và gửi mail cho ứng viên");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể hủy lịch phỏng vấn",
      );
    } finally {
      setCancellingInterviewId("");
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-foreground">
          Lịch phỏng vấn
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi lịch hẹn, cập nhật thông tin và hủy lịch khi cần.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatCard label="Tổng lịch" value={stats.total} />
        <StatCard label="Chờ xác nhận" value={stats.pending} />
        <StatCard
          label="Đã xác nhận"
          value={stats.accepted}
          className="text-success"
        />
        <StatCard
          label="Đã hủy"
          value={stats.cancelled}
          className="text-muted-foreground"
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo ứng viên, vị trí, công ty..."
              className="h-11 rounded-xl border-border bg-muted/50 pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"
          >
            <option value="">Mọi trạng thái</option>
            {Object.entries(INTERVIEW_STATUS_LABEL).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isLoading ? "Đang tải..." : `${total} lịch phỏng vấn`}
        </p>
      </section>

      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : interviews.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <CalendarRange className="mx-auto h-9 w-9 text-primary" />
          <p className="mt-3 text-sm font-bold text-foreground">
            {keyword || statusFilter
              ? "Không tìm thấy lịch phỏng vấn phù hợp"
              : "Chưa có lịch phỏng vấn"}
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {interviews.map((interview) => {
            const isExpired = isInterviewExpired(interview);
            const canManage =
              interview.status !== "CANCELLED" && !isExpired;

            return (
              <article
                key={interview.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                      {interview.candidate.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={interview.candidate.avatar}
                          alt={interview.candidate.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-black text-foreground">
                          {interview.candidate.fullName}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(interview.status)}`}
                        >
                          {INTERVIEW_STATUS_LABEL[interview.status]}
                        </span>
                        {isExpired && interview.status === "PENDING" ? (
                          <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
                            Quá hạn xác nhận
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {interview.job.title} ·{" "}
                        {interview.job.company?.name || "Chưa cập nhật công ty"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {interview.candidate.email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {interview.candidate.phone || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!canManage}
                      onClick={() => openEditModal(interview)}
                      className="h-9 gap-2 rounded-xl px-3 text-xs font-bold"
                    >
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        interview.status === "CANCELLED" ||
                        cancellingInterviewId === interview.id
                      }
                      onClick={() => void handleCancelInterview(interview)}
                      className="h-9 gap-2 rounded-xl px-3 text-xs font-bold text-destructive"
                    >
                      {cancellingInterviewId === interview.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarX className="h-4 w-4" />
                      )}
                      Hủy
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                  <InfoBlock
                    icon={CalendarRange}
                    label="Thời gian"
                    value={formatDate(interview.scheduledAt)}
                  />
                  <InfoBlock
                    icon={Clock3}
                    label="Thời lượng"
                    value={`${interview.durationMinutes} phút`}
                  />
                  <InfoBlock
                    icon={MapPin}
                    label="Địa điểm"
                    value={interview.location || "Chưa cập nhật"}
                  />
                  <InfoBlock
                    icon={Video}
                    label="Phòng họp"
                    value={interview.meetingUrl ? "Mở link phỏng vấn" : "Chưa cập nhật"}
                    href={interview.meetingUrl || undefined}
                  />
                </div>

                {interview.note ? (
                  <div className="mt-3 flex gap-2 rounded-xl bg-muted/60 p-3 text-sm text-foreground">
                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="whitespace-pre-line">{interview.note}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchInterviews(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchInterviews(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {editingInterview ? (
        <InterviewEditModal
          interview={editingInterview}
          form={interviewForm}
          isSubmitting={isUpdatingInterview}
          onChange={(key, value) =>
            setInterviewForm((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
          onSubmit={handleUpdateInterview}
          onClose={() => setEditingInterview(null)}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "text-foreground",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${className}`}>{value}</p>
    </article>
  );
}

function InfoBlock({
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
        className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 hover:bg-primary/10"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
      {content}
    </div>
  );
}

function InterviewEditModal({
  interview,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  interview: InterviewProfile;
  form: InterviewFormState;
  isSubmitting: boolean;
  onChange: (key: keyof InterviewFormState, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 px-4 py-6">
      <section className="w-full max-w-xl rounded-2xl bg-card p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground">
              Sửa lịch phỏng vấn
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {interview.candidate.fullName} · {interview.job.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-5 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-bold text-foreground">
              Thời gian phỏng vấn
            </span>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => onChange("scheduledAt", event.target.value)}
              className="h-11 w-full rounded-xl border border-border px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-foreground">
              Thời lượng
            </span>
            <input
              type="number"
              min={15}
              max={480}
              value={form.durationMinutes}
              onChange={(event) =>
                onChange("durationMinutes", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-border px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-foreground">
              Link phỏng vấn
            </span>
            <input
              value={form.meetingUrl}
              onChange={(event) => onChange("meetingUrl", event.target.value)}
              className="h-11 w-full rounded-xl border border-border px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-foreground">
              Địa điểm
            </span>
            <input
              value={form.location}
              onChange={(event) => onChange("location", event.target.value)}
              className="h-11 w-full rounded-xl border border-border px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-foreground">Ghi chú</span>
            <textarea
              rows={4}
              value={form.note}
              onChange={(event) => onChange("note", event.target.value)}
              className="w-full resize-none rounded-xl border border-border px-3 py-2 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl font-bold"
          >
            Đóng
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="h-10 gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </section>
    </div>
  );
}

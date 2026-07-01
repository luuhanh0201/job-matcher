"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarPlus,
  CalendarClock,
  ClipboardList,
  Eye,
  FileText,
  Globe,
  Loader2,
  Mail,
  Phone,
  X,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCandidateProfile } from "@/services/candidate-profile.service";
import {
  getCandidateCvList,
  getCvPreviewObjectUrl,
} from "@/services/cv.service";
import { createInterview } from "@/services/interview.service";
import {
  getJobApplicationStatusLogs,
  getRecruiterApplications,
  updateJobApplicationStatus,
} from "@/services/job-application.service";
import type { CandidateProfile } from "@/types/candidate-profile";
import type { CvRecord } from "@/types/cv";
import {
  JOB_APPLICATION_STATUS_LABEL,
  type JobApplicationProfile,
  type JobApplicationStatusLog,
  type JobApplicationStatus,
} from "@/types/job-application";

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

function getStatusClass(status: JobApplicationStatus) {
  if (status === "SHORTLISTED" || status === "HIRED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "REJECTED") {
    return "bg-rose-100 text-rose-700";
  }
  if (status === "INTERVIEW") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "VIEWED") {
    return "bg-violet-100 text-violet-700";
  }
  return "bg-amber-100 text-amber-700";
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<JobApplicationProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<CandidateProfile | null>(null);
  const [selectedProfileCvs, setSelectedProfileCvs] = useState<CvRecord[]>([]);
  const [cvPreview, setCvPreview] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [isLoadingCvPreview, setIsLoadingCvPreview] = useState(false);
  const [isLoadingStatusChange, setIsLoadingStatusChange] = useState<
    string | null
  >(null);
  const [statusLogsByApplicationId, setStatusLogsByApplicationId] = useState<
    Record<string, JobApplicationStatusLog[]>
  >({});
  const [selectedApplicationForInterview, setSelectedApplicationForInterview] =
    useState<JobApplicationProfile | null>(null);
  const [isCreatingInterview, setIsCreatingInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: "",
    durationMinutes: "60",
    meetingUrl: "",
    location: "",
    note: "",
  });

  useEffect(() => {
    getRecruiterApplications()
      .then((items) => {
        setApplications(items);
        void loadStatusLogs(items.map((item) => item.id));
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách ứng viên",
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

  const stats = useMemo(() => {
    return applications.reduce(
      (result, application) => {
        result.total += 1;
        if (application.status === "PENDING") result.pending += 1;
        if (application.status === "SHORTLISTED") result.shortlisted += 1;
        if (application.status === "REJECTED") result.rejected += 1;
        return result;
      },
      {
        total: 0,
        pending: 0,
        shortlisted: 0,
        rejected: 0,
      },
    );
  }, [applications]);

  const handleViewProfile = async (candidateId: string) => {
    try {
      const [profile, cvs] = await Promise.all([
        getCandidateProfile(candidateId),
        getCandidateCvList(candidateId),
      ]);
      setSelectedProfile(profile);
      setSelectedProfileCvs(cvs);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải hồ sơ ứng viên",
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleStatusChange = async (
    application: JobApplicationProfile,
    status: JobApplicationStatus,
  ) => {
    if (application.status === status) {
      return;
    }

    setIsLoadingStatusChange(application.id);
    try {
      const updatedApplication = await updateJobApplicationStatus(
        application.id,
        status,
      );
      setApplications((prev) =>
        prev.map((item) =>
          item.id === updatedApplication.id ? updatedApplication : item,
        ),
      );
      await loadStatusLogs([application.id]);
      toast.success("Đã cập nhật trạng thái ứng viên");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái ứng viên",
      );
    } finally {
      setIsLoadingStatusChange(null);
    }
  };

  const openInterviewForm = (application: JobApplicationProfile) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setMinutes(0, 0, 0);
    setInterviewForm({
      scheduledAt: toDateTimeLocalValue(tomorrow),
      durationMinutes: "60",
      meetingUrl: "",
      location: "",
      note: "",
    });
    setSelectedApplicationForInterview(application);
  };

  const handleCreateInterview = async () => {
    if (!selectedApplicationForInterview) {
      return;
    }
    if (!interviewForm.scheduledAt) {
      toast.error("Vui lòng chọn thời gian phỏng vấn");
      return;
    }

    setIsCreatingInterview(true);
    try {
      await createInterview(selectedApplicationForInterview.id, {
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes || 60),
        meetingUrl: interviewForm.meetingUrl,
        location: interviewForm.location,
        note: interviewForm.note,
      });
      setApplications((prev) =>
        prev.map((item) =>
          item.id === selectedApplicationForInterview.id
            ? { ...item, status: "INTERVIEW" }
            : item,
        ),
      );
      await loadStatusLogs([selectedApplicationForInterview.id]);
      setSelectedApplicationForInterview(null);
      toast.success("Đã gửi lời mời phỏng vấn cho ứng viên");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo lịch phỏng vấn",
      );
    } finally {
      setIsCreatingInterview(false);
    }
  };

  const closeCvPreview = () => {
    if (cvPreview?.url) {
      URL.revokeObjectURL(cvPreview.url);
    }
    setCvPreview(null);
  };

  const openCvPreview = async (cv: CvRecord) => {
    if (!cv.id) {
      toast.error("CV không hợp lệ");
      return;
    }
    setIsLoadingCvPreview(true);
    try {
      const objectUrl = await getCvPreviewObjectUrl(cv.id);
      if (cvPreview?.url) {
        URL.revokeObjectURL(cvPreview.url);
      }
      setCvPreview({
        title: cv.fileName || "CV ứng viên",
        url: objectUrl,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xem trực tiếp CV",
      );
    } finally {
      setIsLoadingCvPreview(false);
    }
  };

  const handleViewCv = async (application: JobApplicationProfile) => {
    if (application.cv?.id) {
      await openCvPreview(application.cv);
      return;
    }

    try {
      const cvs = await getCandidateCvList(application.candidate.id);
      const latestCv = cvs.find((cv) => cv.id);
      if (!latestCv) {
        toast.error("Ứng viên chưa có CV");
        return;
      }
      await openCvPreview(latestCv);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải CV ứng viên",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-(--gray-500)" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-(--gray-900)">
            Quản lý ứng viên
          </h1>
          <p className="mt-1 text-sm text-(--gray-500)">
            Danh sách ứng viên đã ứng tuyển vào các tin tuyển dụng của bạn.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <StatCard label="Tổng ứng viên" value={stats.total} />
        <StatCard label="Mới nộp" value={stats.pending} />
        <StatCard
          label="Phù hợp"
          value={stats.shortlisted}
          className="text-emerald-600"
        />
        <StatCard
          label="Từ chối"
          value={stats.rejected}
          className="text-rose-600"
        />
      </section>

      {applications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-(--gray-200) bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-(--blue-light) text-(--primary-blue)">
            <UserRound className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-black text-(--gray-900)">
            Chưa có ứng viên
          </h2>
          <p className="mt-2 text-sm font-medium text-(--gray-500)">
            Khi candidate ứng tuyển, hồ sơ sẽ tự động xuất hiện tại đây.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {applications.map((application) => (
            <article
              key={application.id}
              className="relative rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--blue-light) text-(--primary-blue)">
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
                      <h2 className="truncate text-base font-black text-(--gray-900)">
                        {application.candidate.fullName}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(application.status)}`}
                      >
                        {JOB_APPLICATION_STATUS_LABEL[application.status]}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-(--gray-600) md:grid-cols-2">
                      <InfoLine
                        icon={BriefcaseBusiness}
                        value={application.job.title}
                        href={`/recruiter/manage-jobs/${application.jobId}`}
                      />
                      <InfoLine
                        icon={CalendarClock}
                        value={formatDate(application.createdAt)}
                      />
                      <InfoLine
                        icon={Mail}
                        value={application.candidate.email}
                      />
                      <InfoLine
                        icon={Phone}
                        value={application.candidate.phone || "Chưa cập nhật"}
                      />
                    </div>
                    {isLoadingStatusChange === application.id ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70">
                        <Loader2 className="h-5 w-5 animate-spin text-(--primary-blue)" />
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <select
                          value={application.status}
                          onChange={(event) =>
                          handleStatusChange(
                            application,
                            event.target.value as JobApplicationStatus,
                          )
                        }
                        className="h-10 rounded-xl border border-(--gray-200) bg-white px-3 text-sm font-bold text-(--gray-900) outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {Object.entries(JOB_APPLICATION_STATUS_LABEL).map(
                          ([status, label]) => (
                            <option key={status} value={status}>
                              {label}
                            </option>
                          ),
                          )}
                        </select>
                        {application.status !== "HIRED" ? (
                          <Button
                            type="button"
                            onClick={() => openInterviewForm(application)}
                            className="h-10 gap-2 rounded-xl bg-(--primary-blue) px-4 font-bold text-white hover:bg-(--blue-dark)"
                          >
                            <CalendarPlus className="h-4 w-4" />
                            Mời phỏng vấn
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleViewProfile(application.candidate.id)}
                    className="h-10 w-full gap-2 rounded-xl font-bold lg:w-36"
                  >
                    <UserRound className="h-4 w-4" />
                    Xem hồ sơ
                  </Button>
                  {application.cv?.fileUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleViewCv(application)}
                      className="h-10 w-full gap-2 rounded-xl font-bold lg:w-36"
                    >
                      <Eye className="h-4 w-4" />
                      Xem CV
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleViewCv(application)}
                      className="h-10 w-full gap-2 rounded-xl font-bold text-(--gray-600) lg:w-36"
                    >
                      <Eye className="h-4 w-4" />
                      Tìm CV
                    </Button>
                  )}
                </div>
              </div>

              {application.coverLetter ? (
                <div className="mt-4 rounded-xl bg-(--gray-100)/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-(--gray-900)">
                    <FileText className="h-4 w-4 text-(--primary-blue)" />
                    Thư ứng tuyển
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-(--gray-700)">
                    {application.coverLetter}
                  </p>
                </div>
              ) : null}

              <StatusHistory
                logs={statusLogsByApplicationId[application.id] ?? []}
              />
            </article>
          ))}
        </section>
      )}

      {isLoadingProfile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-(--gray-700) shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-(--primary-blue)" />
            Đang tải hồ sơ ứng viên...
          </div>
        </div>
      ) : null}

      {isLoadingCvPreview ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-(--gray-700) shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-(--primary-blue)" />
            Đang mở CV PDF...
          </div>
        </div>
      ) : null}

      {selectedProfile ? (
        <CandidateProfileModal
          profile={selectedProfile}
          cvs={selectedProfileCvs}
          onClose={() => {
            setSelectedProfile(null);
            setSelectedProfileCvs([]);
          }}
          onViewCv={(cv) => {
            void openCvPreview(cv);
          }}
        />
      ) : null}

      {cvPreview ? (
        <CvPreviewModal
          title={cvPreview.title}
          url={cvPreview.url}
          onClose={closeCvPreview}
        />
      ) : null}

      {selectedApplicationForInterview ? (
        <InterviewFormModal
          application={selectedApplicationForInterview}
          form={interviewForm}
          isSubmitting={isCreatingInterview}
          onChange={(key, value) =>
            setInterviewForm((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
          onSubmit={handleCreateInterview}
          onClose={() => setSelectedApplicationForInterview(null)}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "text-(--gray-900)",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <article className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--gray-500)">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${className}`}>{value}</p>
    </article>
  );
}

function StatusHistory({ logs }: { logs: JobApplicationStatusLog[] }) {
  return (
    <section className="mt-4 rounded-xl border border-(--gray-200) bg-(--gray-100)/40 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-(--gray-900)">
        <ClipboardList className="h-4 w-4 text-(--primary-blue)" />
        Lịch sử trạng thái
      </div>

      {logs.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-(--gray-500)">
          Chưa có lịch sử thay đổi.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-(--primary-blue)" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-(--gray-800)">
                  {log.content}
                </p>
                <p className="mt-1 text-xs font-medium text-(--gray-500)">
                  {formatDate(log.createdAt)} ·{" "}
                  {log.changedBy?.fullName || "Không xác định"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  {log.fromStatus ? (
                    <>
                      <span
                        className={`rounded-full px-2 py-0.5 ${getStatusClass(log.fromStatus)}`}
                      >
                        {JOB_APPLICATION_STATUS_LABEL[log.fromStatus]}
                      </span>
                      <span className="text-(--gray-400)">→</span>
                    </>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 ${getStatusClass(log.toStatus)}`}
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

function CandidateProfileModal({
  profile,
  cvs,
  onClose,
  onViewCv,
}: {
  profile: CandidateProfile;
  cvs: CvRecord[];
  onClose: () => void;
  onViewCv: (cv: CvRecord) => void;
}) {
  const profileData = profile.profile;
  const skills = profileData?.skills ?? [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-(--gray-200) p-5">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--blue-light) text-(--primary-blue)">
              {profile.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.avatar}
                  alt={profile.user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-(--gray-900)">
                {profile.user.fullName}
              </h2>
              <p className="mt-1 text-sm font-bold text-(--gray-600)">
                {profileData?.currentTitle || "Chưa cập nhật vị trí"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-(--gray-600)">
                <InfoPill icon={Mail} value={profile.user.email} />
                <InfoPill
                  icon={Phone}
                  value={profile.user.phone || "Chưa cập nhật SĐT"}
                />
                <InfoPill
                  icon={CalendarClock}
                  value={profileData?.totalExperienceYears || "Chưa cập nhật"}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--gray-200) text-(--gray-500) hover:bg-(--gray-100)"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <ProfileSection title="Tóm tắt" content={profileData?.summary} />
            <ProfileSection
              title="Học vấn"
              content={profileData?.education?.join("\n")}
            />
            <ProfileSection
              title="Kinh nghiệm"
              content={profileData?.workExperience?.join("\n")}
            />
            <ProfileSection
              title="Chứng chỉ"
              content={profileData?.certifications?.join("\n")}
            />
            <ProfileSection
              title="Ngôn ngữ"
              content={profileData?.languages?.join(", ")}
            />
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-(--gray-200) bg-white p-4">
              <h3 className="text-sm font-black text-(--gray-900)">Kỹ năng</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
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

            <section className="rounded-2xl border border-(--gray-200) bg-white p-4">
              <h3 className="text-sm font-black text-(--gray-900)">Liên kết</h3>
              <div className="mt-3 space-y-2 text-sm">
                <InfoPill
                  icon={Globe}
                  value={profileData?.portfolioUrl || "Chưa cập nhật portfolio"}
                />
                <InfoPill
                  icon={Globe}
                  value={profileData?.linkedinUrl || "Chưa cập nhật LinkedIn"}
                />
                <InfoPill
                  icon={Globe}
                  value={profileData?.githubUrl || "Chưa cập nhật GitHub"}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-(--gray-200) bg-white p-4">
              <h3 className="text-sm font-black text-(--gray-900)">CV PDF</h3>
              <div className="mt-3 space-y-2">
                {cvs.length > 0 ? (
                  cvs.map((cv) => (
                    <button
                      key={cv.id}
                      type="button"
                      onClick={() => onViewCv(cv)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 py-2 text-left hover:bg-(--blue-light)/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-(--gray-900)">
                          {cv.fileName || "CV PDF"}
                        </span>
                        <span className="text-xs font-medium text-(--gray-500)">
                          {formatDate(cv.createdAt)}
                        </span>
                      </span>
                      <Eye className="h-4 w-4 shrink-0 text-(--primary-blue)" />
                    </button>
                  ))
                ) : (
                  <p className="rounded-xl bg-(--gray-100)/60 p-3 text-sm font-medium text-(--gray-500)">
                    Ứng viên chưa upload CV PDF.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

function CvPreviewModal({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/55 px-4 py-6">
      <section className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between gap-4 border-b border-(--gray-200) px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-(--gray-900)">
              {title}
            </h2>
            <p className="mt-1 text-xs font-medium text-(--gray-500)">
              Xem trực tiếp CV PDF
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--gray-200) text-(--gray-500) hover:bg-(--gray-100)"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <iframe
          src={url}
          title={title}
          className="min-h-0 flex-1 rounded-b-2xl"
        />
      </section>
    </div>
  );
}

function InterviewFormModal({
  application,
  form,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  application: JobApplicationProfile;
  form: {
    scheduledAt: string;
    durationMinutes: string;
    meetingUrl: string;
    location: string;
    note: string;
  };
  isSubmitting: boolean;
  onChange: (key: keyof typeof form, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 px-4 py-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-(--gray-900)">
              Mời phỏng vấn
            </h2>
            <p className="mt-1 text-sm font-medium text-(--gray-500)">
              {application.candidate.fullName} · {application.job.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-(--gray-200) text-(--gray-500) hover:bg-(--gray-100)"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-5 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-bold text-(--gray-700)">
              Thời gian phỏng vấn
            </span>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => onChange("scheduledAt", event.target.value)}
              className="h-11 w-full rounded-xl border border-(--gray-200) px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-(--gray-700)">
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
              className="h-11 w-full rounded-xl border border-(--gray-200) px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-(--gray-700)">
              Link phỏng vấn
            </span>
            <input
              value={form.meetingUrl}
              onChange={(event) => onChange("meetingUrl", event.target.value)}
              className="h-11 w-full rounded-xl border border-(--gray-200) px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-(--gray-700)">
              Địa điểm
            </span>
            <input
              value={form.location}
              onChange={(event) => onChange("location", event.target.value)}
              className="h-11 w-full rounded-xl border border-(--gray-200) px-3 text-sm font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-bold text-(--gray-700)">Ghi chú</span>
            <textarea
              rows={4}
              value={form.note}
              onChange={(event) => onChange("note", event.target.value)}
              className="w-full resize-none rounded-xl border border-(--gray-200) px-3 py-2 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            Hủy
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="h-10 gap-2 rounded-xl bg-(--primary-blue) px-4 font-bold text-white hover:bg-(--blue-dark)"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            Gửi lời mời
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProfileSection({
  title,
  content,
}: {
  title: string;
  content?: string | null;
}) {
  return (
    <section className="rounded-2xl border border-(--gray-200) bg-white p-4">
      <h3 className="text-sm font-black text-(--gray-900)">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-(--gray-700)">
        {content || "Chưa cập nhật"}
      </p>
    </section>
  );
}

function InfoPill({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2 rounded-xl bg-(--gray-100)/70 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-(--gray-400)" />
      <span className="truncate font-medium">{value}</span>
    </span>
  );
}

function InfoLine({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ElementType;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-(--gray-400)" />
      <span className="truncate font-medium">{value}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex min-w-0 items-center gap-2 font-bold text-(--primary-blue) hover:underline"
      >
        {content}
      </Link>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-2">
      {content}
    </span>
  );
}

"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  Code,
  Eye,
  FileText,
  FileUp,
  Globe,
  LinkIcon,
  Loader2,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMyCandidateProfile,
  updateMyCandidateProfile,
} from "@/services/candidate-profile.service";
import {
  getCvList,
  getCvPreviewObjectUrl,
  uploadCvFile,
} from "@/services/cv.service";
import type {
  CandidateProfile,
  CandidateProfilePayload,
} from "@/types/candidate-profile";
import type { CvRecord } from "@/types/cv";

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  currentTitle: string;
  totalExperienceYears: string;
  summary: string;
  skills: string;
  education: string;
  workExperience: string;
  certifications: string;
  languages: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
};

const EMPTY_FORM: ProfileForm = {
  fullName: "",
  email: "",
  phone: "",
  avatar: "",
  currentTitle: "",
  totalExperienceYears: "",
  summary: "",
  skills: "",
  education: "",
  workExperience: "",
  certifications: "",
  languages: "",
  portfolioUrl: "",
  linkedinUrl: "",
  githubUrl: "",
};

function formatDate(value?: string) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function joinList(value?: string[] | null) {
  return value?.join(", ") ?? "";
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(profile: CandidateProfile): ProfileForm {
  return {
    fullName: profile.user.fullName ?? "",
    email: profile.user.email ?? "",
    phone: profile.user.phone ?? "",
    avatar: profile.user.avatar ?? "",
    currentTitle: profile.profile?.currentTitle ?? "",
    totalExperienceYears: profile.profile?.totalExperienceYears ?? "",
    summary: profile.profile?.summary ?? "",
    skills: joinList(profile.profile?.skills),
    education: joinList(profile.profile?.education),
    workExperience: joinList(profile.profile?.workExperience),
    certifications: joinList(profile.profile?.certifications),
    languages: joinList(profile.profile?.languages),
    portfolioUrl: profile.profile?.portfolioUrl ?? "",
    linkedinUrl: profile.profile?.linkedinUrl ?? "",
    githubUrl: profile.profile?.githubUrl ?? "",
  };
}

function toPayload(form: ProfileForm): CandidateProfilePayload {
  return {
    fullName: form.fullName,
    phone: form.phone,
    avatar: form.avatar,
    currentTitle: form.currentTitle,
    totalExperienceYears: form.totalExperienceYears,
    summary: form.summary,
    skills: splitList(form.skills),
    education: splitList(form.education),
    workExperience: splitList(form.workExperience),
    certifications: splitList(form.certifications),
    languages: splitList(form.languages),
    portfolioUrl: form.portfolioUrl,
    linkedinUrl: form.linkedinUrl,
    githubUrl: form.githubUrl,
  };
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [cvs, setCvs] = useState<CvRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCvPreview, setIsLoadingCvPreview] = useState(false);
  const [cvPreview, setCvPreview] = useState<{
    cvId: string;
    title: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([getMyCandidateProfile(), getCvList()])
      .then(([profile, cvItems]) => {
        setForm(toForm(profile));
        setCvs(cvItems);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải hồ sơ ứng viên",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const firstCv = cvs[0];
    if (!firstCv?.id || cvPreview) {
      return;
    }

    void openCvPreview(firstCv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvs]);

  useEffect(() => {
    return () => {
      if (cvPreview?.url) {
        URL.revokeObjectURL(cvPreview.url);
      }
    };
  }, [cvPreview?.url]);

  const skillPreview = useMemo(() => splitList(form.skills), [form.skills]);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const openCvPreview = async (cv: CvRecord) => {
    if (!cv.id) {
      toast.error("CV không hợp lệ");
      return;
    }

    setIsLoadingCvPreview(true);
    try {
      const objectUrl = await getCvPreviewObjectUrl(cv.id);
      setCvPreview((prev) => {
        if (prev?.url) {
          URL.revokeObjectURL(prev.url);
        }
        return {
          cvId: cv.id,
          title: cv.fileName || "CV PDF",
          url: objectUrl,
        };
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xem trực tiếp CV",
      );
    } finally {
      setIsLoadingCvPreview(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = await updateMyCandidateProfile(toPayload(form));
      setForm(toForm(updatedProfile));
      toast.success("Đã cập nhật hồ sơ ứng viên");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật hồ sơ",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCv = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file PDF trước khi upload");
      return;
    }

    setIsUploading(true);
    try {
      await uploadCvFile(selectedFile);
      const cvItems = await getCvList();
      setCvs(cvItems);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Upload CV thành công");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể upload CV");
    } finally {
      setIsUploading(false);
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
      <header className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--blue-light) text-(--primary-blue)">
              {form.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.avatar}
                  alt={form.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-(--gray-900)">
                Hồ sơ ứng viên
              </h1>
              <p className="mt-1 text-sm font-medium text-(--gray-500)">
                Cập nhật thông tin cá nhân và quản lý CV ứng tuyển của bạn.
              </p>
            </div>
          </div>

          <Button
            disabled={isSaving}
            onClick={handleSaveProfile}
            className="h-11 gap-2 rounded-xl bg-(--primary-blue) px-5 font-bold text-white hover:bg-(--blue-dark)"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu hồ sơ
          </Button>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-(--gray-900)">
              Thông tin cá nhân
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Họ tên">
                <Input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Số điện thoại">
                <Input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Avatar URL">
                <Input
                  value={form.avatar}
                  onChange={(event) => updateField("avatar", event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Vị trí hiện tại">
                <Input
                  value={form.currentTitle}
                  onChange={(event) =>
                    updateField("currentTitle", event.target.value)
                  }
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Kinh nghiệm">
                <Input
                  value={form.totalExperienceYears}
                  onChange={(event) =>
                    updateField("totalExperienceYears", event.target.value)
                  }
                  placeholder="Ví dụ: 2 năm"
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Portfolio">
                <Input
                  value={form.portfolioUrl}
                  onChange={(event) =>
                    updateField("portfolioUrl", event.target.value)
                  }
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="LinkedIn">
                <Input
                  value={form.linkedinUrl}
                  onChange={(event) =>
                    updateField("linkedinUrl", event.target.value)
                  }
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="GitHub">
                <Input
                  value={form.githubUrl}
                  onChange={(event) => updateField("githubUrl", event.target.value)}
                  className="h-11 rounded-xl"
                />
              </Field>
            </div>

            <div className="mt-4">
              <TextAreaField
                label="Tóm tắt hồ sơ"
                value={form.summary}
                onChange={(value) => updateField("summary", value)}
                rows={5}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-(--gray-900)">
              Năng lực và kinh nghiệm
            </h2>
            <div className="mt-4 grid gap-4">
              <TextAreaField
                label="Kỹ năng"
                value={form.skills}
                onChange={(value) => updateField("skills", value)}
                placeholder="React, NestJS, PostgreSQL"
              />
              <TextAreaField
                label="Học vấn"
                value={form.education}
                onChange={(value) => updateField("education", value)}
                placeholder="Đại học A - Công nghệ thông tin"
              />
              <TextAreaField
                label="Kinh nghiệm làm việc"
                value={form.workExperience}
                onChange={(value) => updateField("workExperience", value)}
                placeholder="Công ty B - Frontend Developer - 2024"
              />
              <TextAreaField
                label="Chứng chỉ"
                value={form.certifications}
                onChange={(value) => updateField("certifications", value)}
              />
              <TextAreaField
                label="Ngôn ngữ"
                value={form.languages}
                onChange={(value) => updateField("languages", value)}
                placeholder="Tiếng Việt, English"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-black text-(--gray-900)">
              <FileUp className="h-5 w-5 text-(--primary-blue)" />
              Upload CV
            </h2>
            <div className="mt-4 rounded-2xl border-2 border-dashed border-(--primary-blue)/30 bg-(--blue-light)/30 p-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleSelectFile}
                className="h-11 rounded-xl bg-white"
              />
              <p className="mt-2 text-xs font-medium text-(--gray-500)">
                Chỉ hỗ trợ PDF, tối đa 5MB.
              </p>
              <Button
                disabled={isUploading}
                onClick={handleUploadCv}
                className="mt-4 h-10 w-full gap-2 rounded-xl bg-(--primary-blue) font-bold text-white hover:bg-(--blue-dark)"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileUp className="h-4 w-4" />
                )}
                Upload CV
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-black text-(--gray-900)">
              <FileText className="h-5 w-5 text-(--primary-blue)" />
              CV của bạn
            </h2>
            <div className="mt-4 space-y-3">
              {cvs.length > 0 ? (
                <>
                  <div className="overflow-hidden rounded-xl border border-(--gray-200) bg-(--gray-100)/50">
                    <div className="border-b border-(--gray-200) px-3 py-2">
                      <p className="truncate text-sm font-black text-(--gray-900)">
                        {cvPreview?.title || cvs[0]?.fileName || "CV PDF"}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-(--gray-500)">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(
                          cvs.find((cv) => cv.id === cvPreview?.cvId)
                            ?.createdAt ?? cvs[0]?.createdAt,
                        )}
                      </p>
                    </div>
                    <div className="relative h-80 bg-white">
                      {isLoadingCvPreview ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white">
                          <Loader2 className="h-6 w-6 animate-spin text-(--primary-blue)" />
                        </div>
                      ) : cvPreview?.url ? (
                        <iframe
                          src={cvPreview.url}
                          title={cvPreview.title}
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-4 text-center text-sm font-medium text-(--gray-500)">
                          Không thể hiển thị CV trực tiếp.
                        </div>
                      )}
                    </div>
                  </div>

                  {cvs.length > 1 ? (
                    <div className="space-y-2">
                      {cvs.map((cv) => (
                        <button
                          key={cv.id}
                          type="button"
                          onClick={() => openCvPreview(cv)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                            cvPreview?.cvId === cv.id
                              ? "border-(--primary-blue) bg-(--blue-light)"
                              : "border-(--gray-200) bg-(--gray-100)/50 hover:bg-(--blue-light)/50"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-black text-(--gray-900)">
                              {cv.fileName || "CV PDF"}
                            </span>
                            <span className="text-xs font-medium text-(--gray-500)">
                              {formatDate(cv.createdAt)}
                            </span>
                          </span>
                          <Eye className="h-4 w-4 shrink-0 text-(--primary-blue)" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="rounded-xl bg-(--gray-100)/60 p-4 text-sm font-medium text-(--gray-500)">
                  Bạn chưa upload CV nào.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-(--gray-900)">
              Xem nhanh
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <InfoLine icon={BriefcaseBusiness} value={form.currentTitle || "--"} />
              <InfoLine icon={Phone} value={form.phone || "--"} />
              <InfoLine icon={Mail} value={form.email || "--"} />
              <InfoLine icon={Globe} value={form.portfolioUrl || "--"} />
              <InfoLine icon={LinkIcon} value={form.linkedinUrl || "--"} />
              <InfoLine icon={Code} value={form.githubUrl || "--"} />
            </div>
            {skillPreview.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {skillPreview.slice(0, 12).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-(--blue-light) px-3 py-1 text-xs font-bold text-(--primary-blue)"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        </aside>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-(--gray-700)">{label}</span>
      {children}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-(--gray-700)">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-xl border border-(--gray-200) bg-white px-3 py-2 text-sm font-medium text-(--gray-900) outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <span className="block text-xs font-medium text-(--gray-500)">
        Nhập nhiều mục bằng dấu phẩy.
      </span>
    </label>
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
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-(--gray-100)/60 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-(--gray-400)" />
      <span className="truncate font-bold text-(--gray-700)">{value}</span>
    </div>
  );
}

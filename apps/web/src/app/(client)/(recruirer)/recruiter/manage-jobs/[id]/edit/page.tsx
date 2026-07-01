"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CircleDashed,
  CircleDollarSign,
  FileText,
  ListChecks,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJobPostById, updateJobPost, type UpdateJobPostPayload } from "@/services/job.service";
import type { Currency, JobPostProfile, JobType, SalaryType, SeniorityLevel, WorkMode } from "@/types/job";

type EditFormState = {
  title: string;
  department: string;
  jobType: JobType;
  workMode: WorkMode;
  seniorityLevel: SeniorityLevel;
  salaryType: SalaryType;
  salaryMin: string;
  salaryMax: string;
  currency: Currency;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skillsText: string;
  quantity: string;
  expiredAt: string;
};

const JOB_TYPE_OPTIONS: Array<{ value: JobType; label: string }> = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "INTERN", label: "Thực tập" },
  { value: "FREELANCE", label: "Freelance" },
];
const WORK_MODE_OPTIONS: Array<{ value: WorkMode; label: string }> = [
  { value: "ONSITE", label: "Tại văn phòng" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
];
const SENIORITY_OPTIONS: Array<{ value: SeniorityLevel; label: string }> = [
  { value: "NO_EXPERIENCE", label: "Không yêu cầu" },
  { value: "INTERN", label: "Intern" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
];
const SALARY_TYPE_OPTIONS: Array<{ value: SalaryType; label: string }> = [
  { value: "NEGOTIABLE", label: "Thỏa thuận" },
  { value: "RANGE", label: "Khoảng lương" },
  { value: "FIXED", label: "Lương cố định" },
];
const CURRENCY_OPTIONS: Currency[] = ["VND", "USD", "EUR", "GBP"];

function toLocalDatetimeInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function jobToFormState(job: JobPostProfile): EditFormState {
  return {
    title: job.title,
    department: job.department,
    jobType: job.jobType,
    workMode: job.workMode,
    seniorityLevel: job.seniorityLevel,
    salaryType: job.salaryType,
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
    currency: job.currency,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities ?? "",
    benefits: job.benefits ?? "",
    skillsText: job.skills ? job.skills.join(", ") : "",
    quantity: job.quantity != null ? String(job.quantity) : "",
    expiredAt: toLocalDatetimeInput(job.expiredAt),
  };
}

function formToPayload(form: EditFormState): UpdateJobPostPayload {
  const skills = form.skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: form.title.trim(),
    department: form.department.trim(),
    jobType: form.jobType,
    workMode: form.workMode,
    seniorityLevel: form.seniorityLevel,
    salaryType: form.salaryType,
    currency: form.currency,
    salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
    salaryMax:
      form.salaryType === "RANGE" && form.salaryMax
        ? Number(form.salaryMax)
        : form.salaryType === "FIXED" && form.salaryMin
          ? Number(form.salaryMin)
          : undefined,
    description: form.description.trim(),
    requirements: form.requirements.trim(),
    responsibilities: form.responsibilities.trim() || undefined,
    benefits: form.benefits.trim() || undefined,
    skills: skills.length > 0 ? skills : undefined,
    quantity: form.quantity ? Number(form.quantity) : undefined,
    expiredAt: form.expiredAt ? new Date(form.expiredAt).toISOString() : undefined,
  };
}

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<EditFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getJobPostById(id)
      .then((job) => setForm(jobToFormState(job)))
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Không thể tải tin tuyển dụng");
        router.push(`/recruiter/manage-jobs/${id}`);
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  if (isLoading || !form) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
      </div>
    );
  }

  const setField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    if (!form.department.trim()) { toast.error("Vui lòng nhập bộ phận"); return; }
    if (!form.description.trim()) { toast.error("Vui lòng nhập mô tả công việc"); return; }
    if (!form.requirements.trim()) { toast.error("Vui lòng nhập yêu cầu công việc"); return; }
    if (!form.expiredAt) { toast.error("Vui lòng chọn hạn ứng tuyển"); return; }
    if (form.salaryType !== "NEGOTIABLE" && !form.salaryMin) {
      toast.error("Vui lòng nhập mức lương"); return;
    }
    if (form.salaryType === "RANGE") {
      const min = Number(form.salaryMin);
      const max = Number(form.salaryMax);
      if (!form.salaryMax || min > max) {
        toast.error("Khoảng lương không hợp lệ"); return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateJobPost(id, formToPayload(form));
      toast.success("Đã cập nhật tin tuyển dụng");
      router.push(`/recruiter/manage-jobs/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật tin tuyển dụng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <Link
          href={`/recruiter/manage-jobs/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-(--primary-blue) hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại chi tiết
        </Link>
        <h1 className="mt-3 text-2xl font-black text-(--gray-900)">Chỉnh sửa tin tuyển dụng</h1>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm sm:p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Thông tin cơ bản" icon={BriefcaseBusiness}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Vị trí tuyển dụng" htmlFor="title" required>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="VD: Frontend Developer"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                  disabled={isSubmitting}
                />
              </Field>
              <Field label="Bộ phận" htmlFor="department" required>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="VD: Engineering"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                  disabled={isSubmitting}
                />
              </Field>
              <SelectField
                label="Loại công việc"
                htmlFor="jobType"
                required
                value={form.jobType}
                onChange={(v) => setField("jobType", v as JobType)}
                options={JOB_TYPE_OPTIONS}
                disabled={isSubmitting}
              />
              <SelectField
                label="Hình thức làm việc"
                htmlFor="workMode"
                value={form.workMode}
                onChange={(v) => setField("workMode", v as WorkMode)}
                options={WORK_MODE_OPTIONS}
                disabled={isSubmitting}
              />
              <SelectField
                label="Cấp bậc"
                htmlFor="seniorityLevel"
                value={form.seniorityLevel}
                onChange={(v) => setField("seniorityLevel", v as SeniorityLevel)}
                options={SENIORITY_OPTIONS}
                disabled={isSubmitting}
              />
              <Field label="Số lượng" htmlFor="quantity">
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                  placeholder="VD: 2"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                  disabled={isSubmitting}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Lương và hạn ứng tuyển" icon={CircleDollarSign}>
            <div className="grid gap-4 lg:grid-cols-2">
              <SelectField
                label="Loại lương"
                htmlFor="salaryType"
                required
                value={form.salaryType}
                onChange={(v) => setField("salaryType", v as SalaryType)}
                options={SALARY_TYPE_OPTIONS}
                disabled={isSubmitting}
              />
              <Field label="Đơn vị tiền tệ" htmlFor="currency">
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value as Currency)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none transition-colors disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field
                label={form.salaryType === "FIXED" ? "Mức lương" : "Lương tối thiểu"}
                htmlFor="salaryMin"
                required={form.salaryType !== "NEGOTIABLE"}
              >
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  value={form.salaryMin}
                  onChange={(e) => setField("salaryMin", e.target.value)}
                  disabled={form.salaryType === "NEGOTIABLE" || isSubmitting}
                  placeholder="VD: 12000000"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <Field label="Lương tối đa" htmlFor="salaryMax" required={form.salaryType === "RANGE"}>
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  value={form.salaryMax}
                  onChange={(e) => setField("salaryMax", e.target.value)}
                  disabled={form.salaryType !== "RANGE" || isSubmitting}
                  placeholder="VD: 25000000"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <Field label="Hạn ứng tuyển" htmlFor="expiredAt" required>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
                  <Input
                    id="expiredAt"
                    type="datetime-local"
                    value={form.expiredAt}
                    onChange={(e) => setField("expiredAt", e.target.value)}
                    disabled={isSubmitting}
                    className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                  />
                </div>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Nội dung tuyển dụng" icon={FileText}>
            <div className="grid gap-4">
              <TextAreaField
                label="Mô tả công việc"
                htmlFor="description"
                required
                value={form.description}
                onChange={(v) => setField("description", v)}
                placeholder="Mô tả mục tiêu vị trí, sản phẩm/dự án và phạm vi công việc"
                disabled={isSubmitting}
              />
              <TextAreaField
                label="Yêu cầu"
                htmlFor="requirements"
                required
                value={form.requirements}
                onChange={(v) => setField("requirements", v)}
                placeholder="Kinh nghiệm, kỹ năng bắt buộc, tiêu chí đánh giá"
                disabled={isSubmitting}
              />
              <TextAreaField
                label="Trách nhiệm"
                htmlFor="responsibilities"
                value={form.responsibilities}
                onChange={(v) => setField("responsibilities", v)}
                placeholder="Các đầu việc chính của ứng viên khi nhận việc"
                disabled={isSubmitting}
              />
              <TextAreaField
                label="Phúc lợi"
                htmlFor="benefits"
                value={form.benefits}
                onChange={(v) => setField("benefits", v)}
                placeholder="Lương thưởng, bảo hiểm, đào tạo, môi trường làm việc"
                disabled={isSubmitting}
              />
            </div>
          </FormSection>

          <FormSection title="Kỹ năng" icon={ListChecks}>
            <Field label="Kỹ năng liên quan" htmlFor="skillsText">
              <Input
                id="skillsText"
                value={form.skillsText}
                onChange={(e) => setField("skillsText", e.target.value)}
                placeholder="React, Next.js, TypeScript (phân cách bởi dấu phẩy)"
                className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                disabled={isSubmitting}
              />
            </Field>
          </FormSection>

          <div className="flex justify-end gap-3">
            <Link href={`/recruiter/manage-jobs/${id}`}>
              <Button type="button" variant="outline" className="h-11 rounded-xl px-5 font-bold" disabled={isSubmitting}>
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 gap-2 rounded-xl bg-(--primary-blue) px-5 font-bold text-white hover:bg-(--blue-dark)"
            >
              {isSubmitting ? (
                <CircleDashed className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t border-(--gray-200) pt-5 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2 text-base font-black text-(--gray-900)">
        <Icon className="h-5 w-5 text-(--primary-blue)" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, required, children }: { label: string; htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="font-bold">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SelectField({ label, htmlFor, required, value, onChange, options, disabled }: {
  label: string;
  htmlFor: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <Field label={label} htmlFor={htmlFor} required={required}>
      <select
        id={htmlFor}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none transition-colors disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

function TextAreaField({ label, htmlFor, required, value, onChange, placeholder, disabled }: {
  label: string;
  htmlFor: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} htmlFor={htmlFor} required={required}>
      <textarea
        id={htmlFor}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-32 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </Field>
  );
}

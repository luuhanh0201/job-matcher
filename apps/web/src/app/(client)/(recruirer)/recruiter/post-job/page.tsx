"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDashed,
  CircleDollarSign,
  FileText,
  ListChecks,
  MapPin,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  jobPostFormSchema,
  type JobPostFormValues,
} from "@/schemas/job.schema";
import { getMyCompany } from "@/services/company.service";
import { createJobPost } from "@/services/job.service";
import type { CompanyProfile } from "@/types/company";
import type {
  CreateJobPostPayload,
  Currency,
  JobPostStatus,
  JobType,
  SalaryType,
  SeniorityLevel,
  WorkMode,
} from "@/types/job";

type JobPostFormState = {
  title: string;
  companyId: string;
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
  status: Exclude<JobPostStatus, "CLOSED">;
  expiredAt: string;
};

const INITIAL_FORM: JobPostFormState = {
  title: "",
  companyId: "",
  department: "",
  jobType: "FULL_TIME",
  workMode: "ONSITE",
  seniorityLevel: "NO_EXPERIENCE",
  salaryType: "NEGOTIABLE",
  salaryMin: "",
  salaryMax: "",
  currency: "VND",
  description: "",
  requirements: "",
  responsibilities: "",
  benefits: "",
  skillsText: "",
  quantity: "",
  status: "DRAFT",
  expiredAt: "",
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
  { value: "NO_EXPERIENCE", label: "Không yêu cầu kinh nghiệm" },
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

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function splitSkills(value: string) {
  const skills = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return skills.length > 0 ? skills : undefined;
}

function toPayload(values: JobPostFormValues): CreateJobPostPayload {
  return {
    title: values.title.trim(),
    companyId: values.companyId,
    department: values.department.trim(),
    jobType: values.jobType,
    workMode: values.workMode,
    seniorityLevel: values.seniorityLevel,
    salaryType: values.salaryType,
    salaryMin: values.salaryMin,
    salaryMax:
      values.salaryType === "FIXED" ? values.salaryMin : values.salaryMax,
    currency: values.currency,
    description: values.description.trim(),
    requirements: values.requirements.trim(),
    responsibilities: optionalValue(values.responsibilities ?? ""),
    benefits: optionalValue(values.benefits ?? ""),
    skills: splitSkills(values.skillsText ?? ""),
    quantity: values.quantity,
    status: values.status,
    expiredAt: new Date(values.expiredAt).toISOString(),
  };
}

function getTomorrowInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

export default function RecruiterPostJobPage() {
  const [form, setForm] = useState<JobPostFormState>(INITIAL_FORM);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyRequirementMessage, setCompanyRequirementMessage] =
    useState("");

  useEffect(() => {
    setForm((current) => ({ ...current, expiredAt: getTomorrowInputValue() }));
    getMyCompany()
      .then((items) => {
        setCompanies(items);
        const firstCompany = items[0];
        if (firstCompany) {
          setForm((current) => ({ ...current, companyId: firstCompany.id }));
          setCompanyRequirementMessage("");
          return;
        }

        setCompanyRequirementMessage(
          "Vui lòng đăng ký hồ sơ công ty trước khi đăng tuyển dụng",
        );
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Vui lòng đăng ký hồ sơ công ty trước khi đăng tuyển dụng";
        setCompanyRequirementMessage(message);
        toast.error(message);
      })
      .finally(() => setIsLoadingCompanies(false));
  }, []);

  if (isLoadingCompanies) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
          <p className="text-sm font-medium text-(--gray-500)">
            Đang kiểm tra hồ sơ công ty...
          </p>
        </div>
      </div>
    );
  }

  if (companyRequirementMessage || companies.length === 0) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-black text-(--gray-900)">
            Đăng tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-(--gray-500)">
            Tạo tin tuyển dụng theo hồ sơ công ty đã đăng ký.
          </p>
        </header>

        <section className="rounded-2xl border border-(--gray-200) bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--blue-light) text-(--primary-blue)">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-black text-(--gray-900)">
            Chưa có hồ sơ công ty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-(--gray-500)">
            {companyRequirementMessage ||
              "Vui lòng đăng ký hồ sơ công ty trước khi đăng tuyển dụng"}
          </p>
          <Link href="/recruiter/company/profile">
            <Button className="mt-5 h-10 rounded-xl bg-(--primary-blue) px-4 font-bold text-white hover:bg-(--blue-dark)">
              Tạo hồ sơ công ty
            </Button>
          </Link>
        </section>
      </div>
    );
  }

  const selectedCompany = companies.find(
    (company) => company.id === form.companyId,
  );

  const setField = <TKey extends keyof JobPostFormState>(
    key: TKey,
    value: JobPostFormState[TKey],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = jobPostFormSchema.safeParse(form);
    if (!validationResult.success) {
      toast.error(
        validationResult.error.issues[0]?.message ||
          "Thông tin tin tuyển dụng không hợp lệ",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createJobPost(toPayload(validationResult.data));
      toast.success("Đã tạo tin tuyển dụng");
      setForm((current) => ({
        ...INITIAL_FORM,
        companyId: current.companyId,
        expiredAt: getTomorrowInputValue(),
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo tin tuyển dụng",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-(--gray-900)">
            Đăng tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-(--gray-500)">
            Tạo tin tuyển dụng theo hồ sơ công ty đã đăng ký.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-(--primary-blue)/20 bg-(--blue-light) px-3 py-2 text-sm font-bold text-(--primary-blue)">
          <Sparkles className="h-4 w-4" />
          {form.status === "OPEN" ? "Đăng ngay" : "Lưu nháp"}
        </div>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm sm:p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Công ty đăng tuyển" icon={Building2}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Field label="Công ty" htmlFor="companyId" required>
                <select
                  id="companyId"
                  value={form.companyId}
                  onChange={(event) => setField("companyId", event.target.value)}
                  disabled={isLoadingCompanies || companies.length === 0}
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none transition-colors disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">
                    {isLoadingCompanies ? "Đang tải..." : "Chọn công ty"}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--blue-light) text-(--primary-blue)">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-(--gray-900)">
                      {selectedCompany?.name || "Chưa chọn công ty"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-(--gray-500)">
                      {[
                        selectedCompany?.location?.address,
                        selectedCompany?.location?.wardName,
                        selectedCompany?.location?.provinceName,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Địa điểm sẽ lấy theo hồ sơ công ty"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Thông tin cơ bản" icon={BriefcaseBusiness}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Vị trí tuyển dụng" htmlFor="title" required>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="VD: Frontend Developer"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <Field label="Bộ phận" htmlFor="department" required>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(event) =>
                    setField("department", event.target.value)
                  }
                  placeholder="VD: Engineering"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <SelectField
                label="Loại công việc"
                htmlFor="jobType"
                required
                value={form.jobType}
                onChange={(value) => setField("jobType", value as JobType)}
                options={JOB_TYPE_OPTIONS}
              />
              <SelectField
                label="Hình thức làm việc"
                htmlFor="workMode"
                value={form.workMode}
                onChange={(value) => setField("workMode", value as WorkMode)}
                options={WORK_MODE_OPTIONS}
              />
              <SelectField
                label="Cấp bậc"
                htmlFor="seniorityLevel"
                value={form.seniorityLevel}
                onChange={(value) =>
                  setField("seniorityLevel", value as SeniorityLevel)
                }
                options={SENIORITY_OPTIONS}
              />
              <Field label="Số lượng" htmlFor="quantity">
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(event) => setField("quantity", event.target.value)}
                  placeholder="VD: 2"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
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
                onChange={(value) =>
                  setField("salaryType", value as SalaryType)
                }
                options={SALARY_TYPE_OPTIONS}
              />
              <Field label="Đơn vị tiền tệ" htmlFor="currency">
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(event) =>
                    setField("currency", event.target.value as Currency)
                  }
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={
                  form.salaryType === "FIXED"
                    ? "Mức lương"
                    : "Lương tối thiểu"
                }
                htmlFor="salaryMin"
                required={form.salaryType !== "NEGOTIABLE"}
              >
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  value={form.salaryMin}
                  onChange={(event) => setField("salaryMin", event.target.value)}
                  disabled={form.salaryType === "NEGOTIABLE"}
                  placeholder="VD: 12000000"
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <Field
                label="Lương tối đa"
                htmlFor="salaryMax"
                required={form.salaryType === "RANGE"}
              >
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  value={form.salaryMax}
                  onChange={(event) => setField("salaryMax", event.target.value)}
                  disabled={form.salaryType !== "RANGE"}
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
                    onChange={(event) =>
                      setField("expiredAt", event.target.value)
                    }
                    className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                  />
                </div>
              </Field>
              <Field label="Trạng thái" htmlFor="status">
                <select
                  id="status"
                  value={form.status}
                  onChange={(event) =>
                    setField(
                      "status",
                      event.target.value as Exclude<JobPostStatus, "CLOSED">,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="DRAFT">Lưu nháp</option>
                  <option value="OPEN">Đăng ngay</option>
                </select>
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
                onChange={(value) => setField("description", value)}
                placeholder="Mô tả mục tiêu vị trí, sản phẩm/dự án và phạm vi công việc"
              />
              <TextAreaField
                label="Yêu cầu"
                htmlFor="requirements"
                required
                value={form.requirements}
                onChange={(value) => setField("requirements", value)}
                placeholder="Kinh nghiệm, kỹ năng bắt buộc, tiêu chí đánh giá"
              />
              <TextAreaField
                label="Trách nhiệm"
                htmlFor="responsibilities"
                value={form.responsibilities}
                onChange={(value) => setField("responsibilities", value)}
                placeholder="Các đầu việc chính của ứng viên khi nhận việc"
              />
              <TextAreaField
                label="Phúc lợi"
                htmlFor="benefits"
                value={form.benefits}
                onChange={(value) => setField("benefits", value)}
                placeholder="Lương thưởng, bảo hiểm, đào tạo, môi trường làm việc"
              />
            </div>
          </FormSection>

          <FormSection title="Kỹ năng" icon={ListChecks}>
            <Field label="Kỹ năng liên quan" htmlFor="skillsText">
              <Input
                id="skillsText"
                value={form.skillsText}
                onChange={(event) => setField("skillsText", event.target.value)}
                placeholder="React, Next.js, TypeScript"
                className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
              />
            </Field>
          </FormSection>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || companies.length === 0}
              className="h-11 gap-2 rounded-xl bg-(--primary-blue) px-5 font-bold text-white hover:bg-(--blue-dark)"
            >
              {isSubmitting ? (
                <CircleDashed className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Đang tạo..." : "Tạo tin tuyển dụng"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
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

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="font-bold">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  htmlFor,
  required,
  value,
  onChange,
  options,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Field label={label} htmlFor={htmlFor} required={required}>
      <select
        id={htmlFor}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TextAreaField({
  label,
  htmlFor,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} htmlFor={htmlFor} required={required}>
      <textarea
        id={htmlFor}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-32 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </Field>
  );
}

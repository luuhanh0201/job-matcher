"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  CircleDashed,
  Globe,
  ImageIcon,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Save,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  companyProfileSchema,
  logoFileSchema,
} from "@/schemas/company.schema";
import { createCompany } from "@/services/company.service";
import {
  getProvinces,
  getWardsByProvinceCode,
} from "@/services/location.service";
import type {
  CompanyProfile,
  CompanySize,
  CreateCompanyPayload,
} from "@/types/company";
import type { Province, Ward } from "@/types/location";
import { toast } from "sonner";

type CompanyFormState = {
  name: string;
  shortName: string;
  companySize: CompanySize;
  email: string;
  phone: string;
  taxCode: string;
  companyType: string;
  website: string;
  provinceCode: string;
  wardCode: string;
  address: string;
  linkedinUrl: string;
  facebookUrl: string;
  description: string;
};

const INITIAL_FORM: CompanyFormState = {
  name: "",
  shortName: "",
  companySize: "1-10",
  email: "",
  phone: "",
  taxCode: "",
  companyType: "",
  website: "",
  provinceCode: "",
  wardCode: "",
  address: "",
  linkedinUrl: "",
  facebookUrl: "",
  description: "",
};

const COMPANY_SIZE_OPTIONS: Array<{ value: CompanySize; label: string }> = [
  { value: "1-10", label: "1-10 nhân sự" },
  { value: "11-50", label: "11-50 nhân sự" },
  { value: "51-200", label: "51-200 nhân sự" },
  { value: "200+", label: "200+ nhân sự" },
];

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPayload(form: CompanyFormState): CreateCompanyPayload {
  return {
    name: form.name.trim(),
    shortName: optionalValue(form.shortName),
    companySize: form.companySize,
    email: optionalValue(form.email),
    phone: optionalValue(form.phone),
    taxCode: optionalValue(form.taxCode),
    companyType: optionalValue(form.companyType),
    website: optionalValue(form.website),
    location: {
      provinceCode: form.provinceCode,
      wardCode: form.wardCode,
      address: optionalValue(form.address),
    },
    linkedinUrl: optionalValue(form.linkedinUrl),
    facebookUrl: optionalValue(form.facebookUrl),
    description: optionalValue(form.description),
  };
}

export default function RecruiterCompanyProfilePage() {
  const [form, setForm] = useState<CompanyFormState>(INITIAL_FORM);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [createdCompany, setCreatedCompany] = useState<CompanyProfile | null>(
    null,
  );
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    getProvinces()
      .then((items) => setProvinces(items))
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách tỉnh/thành phố",
        );
      })
      .finally(() => setIsLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!form.provinceCode) {
      setWards([]);
      return;
    }

    setIsLoadingWards(true);
    setWards([]);
    setForm((current) => ({ ...current, wardCode: "" }));

    getWardsByProvinceCode(form.provinceCode)
      .then((items) => setWards(items))
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách phường/xã",
        );
      })
      .finally(() => setIsLoadingWards(false));
  }, [form.provinceCode]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const selectedProvince = useMemo(
    () =>
      provinces.find((province) => province.province_code === form.provinceCode),
    [form.provinceCode, provinces],
  );
  const selectedWard = useMemo(
    () => wards.find((ward) => ward.ward_code === form.wardCode),
    [form.wardCode, wards],
  );

  const setField = <TKey extends keyof CompanyFormState>(
    key: TKey,
    value: CompanyFormState[TKey],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const validatedLogo = logoFileSchema.safeParse(file);
    if (!validatedLogo.success) {
      toast.error(validatedLogo.error.issues[0]?.message || "Logo không hợp lệ");
      event.target.value = "";
      return;
    }

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const clearLogoFile = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(null);
    setLogoPreviewUrl("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = companyProfileSchema.safeParse(form);
    if (!validationResult.success) {
      toast.error(
        validationResult.error.issues[0]?.message || "Thông tin công ty không hợp lệ",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const company = await createCompany(buildPayload(form), logoFile);
      setCreatedCompany(company);
      toast.success("Đã tạo hồ sơ công ty thành công");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo hồ sơ công ty",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Hồ sơ công ty
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cập nhật thông tin thương hiệu tuyển dụng để thu hút ứng viên phù
            hợp hơn.
          </p>
        </div>
        {createdCompany ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-bold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Đã tạo hồ sơ
          </div>
        ) : null}
      </header>

      {createdCompany ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">
                {createdCompany.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {createdCompany.companyType || "Chưa cập nhật lĩnh vực"} ·{" "}
                {createdCompany.companySize} nhân sự
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ProfileField
              icon={MapPin}
              label="Địa chỉ"
              value={[
                createdCompany.location?.address,
                createdCompany.location?.wardName,
                createdCompany.location?.provinceName,
              ]
                .filter(Boolean)
                .join(", ")}
            />
            <ProfileField
              icon={Globe}
              label="Website"
              value={createdCompany.website || "Chưa cập nhật"}
            />
            <ProfileField
              icon={Phone}
              label="Hotline"
              value={createdCompany.phone || "Chưa cập nhật"}
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={createdCompany.email || "Chưa cập nhật"}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Thông tin cơ bản" icon={Building2}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Tên công ty" htmlFor="name" required>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="VD: Job Matcher Co., Ltd."
                  className="h-11 rounded-xl border-border bg-muted/50"
                />
              </Field>
              <Field label="Tên viết tắt" htmlFor="shortName">
                <Input
                  id="shortName"
                  value={form.shortName}
                  onChange={(event) =>
                    setField("shortName", event.target.value)
                  }
                  placeholder="VD: JM"
                  className="h-11 rounded-xl border-border bg-muted/50"
                />
              </Field>
              <Field label="Quy mô công ty" htmlFor="companySize" required>
                <select
                  id="companySize"
                  value={form.companySize}
                  onChange={(event) =>
                    setField("companySize", event.target.value as CompanySize)
                  }
                  className="h-11 w-full rounded-xl border border-border bg-muted/50 px-3 text-sm font-medium text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lĩnh vực" htmlFor="companyType">
                <Input
                  id="companyType"
                  value={form.companyType}
                  onChange={(event) =>
                    setField("companyType", event.target.value)
                  }
                  placeholder="VD: Công nghệ thông tin"
                  className="h-11 rounded-xl border-border bg-muted/50"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Liên hệ" icon={Phone}>
            <div className="grid gap-4 lg:grid-cols-2">
              <IconField icon={Mail} label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  placeholder="contact@example.com"
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10"
                />
              </IconField>
              <IconField icon={Phone} label="Số điện thoại" htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  placeholder="VD: 0901234567"
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10"
                />
              </IconField>
              <IconField icon={ReceiptText} label="Mã số thuế" htmlFor="taxCode">
                <Input
                  id="taxCode"
                  value={form.taxCode}
                  onChange={(event) => setField("taxCode", event.target.value)}
                  placeholder="Nhập mã số thuế"
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10"
                />
              </IconField>
              <IconField icon={Globe} label="Website" htmlFor="website">
                <Input
                  id="website"
                  value={form.website}
                  onChange={(event) => setField("website", event.target.value)}
                  placeholder="https://example.com"
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10"
                />
              </IconField>
            </div>
          </FormSection>

          <FormSection title="Địa chỉ" icon={MapPin}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Tỉnh/thành phố"
                htmlFor="provinceCode"
                required
              >
                <select
                  id="provinceCode"
                  value={form.provinceCode}
                  onChange={(event) =>
                    setField("provinceCode", event.target.value)
                  }
                  disabled={isLoadingProvinces}
                  className="h-11 w-full rounded-xl border border-border bg-muted/50 px-3 text-sm font-medium text-foreground outline-none transition-colors disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">
                    {isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                  </option>
                  {provinces.map((province) => (
                    <option
                      key={province.id}
                      value={province.province_code}
                    >
                      {province.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Phường/xã" htmlFor="wardCode" required>
                <select
                  id="wardCode"
                  value={form.wardCode}
                  onChange={(event) => setField("wardCode", event.target.value)}
                  disabled={!form.provinceCode || isLoadingWards}
                  className="h-11 w-full rounded-xl border border-border bg-muted/50 px-3 text-sm font-medium text-foreground outline-none transition-colors disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">
                    {isLoadingWards ? "Đang tải..." : "Chọn phường/xã"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.ward_code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Địa chỉ chi tiết" htmlFor="address">
              <Input
                id="address"
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                placeholder="Số nhà, tên đường, tòa nhà..."
                className="h-11 rounded-xl border-border bg-muted/50"
              />
            </Field>

            {selectedProvince || selectedWard || form.address ? (
              <p className="rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm font-medium text-foreground">
                {[form.address, selectedWard?.name, selectedProvince?.name]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Kênh thương hiệu" icon={LinkIcon}>
            <div className="grid gap-4 lg:grid-cols-2">
              <IconField icon={LinkIcon} label="LinkedIn" htmlFor="linkedinUrl">
                <Input
                  id="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={(event) =>
                    setField("linkedinUrl", event.target.value)
                  }
                  placeholder="https://linkedin.com/company/..."
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10"
                />
              </IconField>
              <IconField icon={LinkIcon} label="Facebook" htmlFor="facebookUrl">
                <Input
                  id="facebookUrl"
                  value={form.facebookUrl}
                  onChange={(event) =>
                    setField("facebookUrl", event.target.value)
                  }
                  placeholder="https://facebook.com/..."
                  className="h-11 rounded-xl border-border bg-muted/50 pl-10"
                />
              </IconField>
              <Field label="Logo công ty" htmlFor="logoFile">
                <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-3 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card text-muted-foreground">
                    {logoPreviewUrl ? (
                      <Image
                        src={logoPreviewUrl}
                        alt="Logo công ty"
                        width={80}
                        height={80}
                        unoptimized
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {logoFile?.name || "Chưa chọn logo"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Chọn file PNG, JPG hoặc WebP để xem trước logo công ty.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <label
                        htmlFor="logoFile"
                        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                      >
                        <Upload className="h-4 w-4" />
                        Chọn logo
                      </label>
                      {logoFile ? (
                        <button
                          type="button"
                          onClick={clearLogoFile}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                          Xóa
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <input
                    id="logoFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoChange}
                    className="sr-only"
                  />
                </div>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Giới thiệu" icon={Users}>
            <Field label="Mô tả công ty" htmlFor="description">
              <textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                placeholder="Mô tả ngắn về công ty, môi trường làm việc và định hướng tuyển dụng"
                className="min-h-32 w-full rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
          </FormSection>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <CircleDashed className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Đang tạo..." : "Tạo hồ sơ công ty"}
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
    <section className="space-y-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2 text-base font-black text-foreground">
        <Icon className="h-5 w-5 text-primary" />
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

function IconField({
  icon: Icon,
  label,
  htmlFor,
  children,
}: {
  icon: React.ElementType;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Field label={label} htmlFor={htmlFor}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </Field>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-border p-3">
      <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">
        {value || "Chưa cập nhật"}
      </p>
    </article>
  );
}

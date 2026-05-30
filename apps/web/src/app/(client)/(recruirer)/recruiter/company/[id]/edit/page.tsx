"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Camera,
  CircleDashed,
  Globe,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Save,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyProfileSchema, logoFileSchema } from "@/schemas/company.schema";
import {
  getCompanyById,
  updateCompany,
  updateCompanyLogo,
} from "@/services/company.service";
import {
  getProvinces,
  getWardsByProvinceCode,
} from "@/services/location.service";
import type {
  CompanyProfile,
  CompanySize,
  UpdateCompanyPayload,
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

function toForm(company: CompanyProfile): CompanyFormState {
  return {
    name: company.name ?? "",
    shortName: company.shortName ?? "",
    companySize: company.companySize ?? "1-10",
    email: company.email ?? "",
    phone: company.phone ?? "",
    taxCode: company.taxCode ?? "",
    companyType: company.companyType ?? "",
    website: company.website ?? "",
    provinceCode: company.location?.provinceCode ?? "",
    wardCode: company.location?.wardCode ?? "",
    address: company.location?.address ?? "",
    linkedinUrl: company.linkedinUrl ?? "",
    facebookUrl: company.facebookUrl ?? "",
    description: company.description ?? "",
  };
}

function buildPayload(form: CompanyFormState): UpdateCompanyPayload {
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

export default function RecruiterCompanyEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState<CompanyFormState>(INITIAL_FORM);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogoSubmitting, setIsLogoSubmitting] = useState(false);
  useEffect(() => {
    Promise.all([getCompanyById(params.id), getProvinces()])
      .then(([company, provinceItems]) => {
        setCompany(company);
        setForm(toForm(company));
        setProvinces(provinceItems);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Không thể tải thông tin công ty",
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingProvinces(false);
      });
  }, [params.id]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  useEffect(() => {
    if (!form.provinceCode) {
      setWards([]);
      return;
    }

    setIsLoadingWards(true);
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

  const handleProvinceChange = (value: string) => {
    setForm((current) => ({
      ...current,
      provinceCode: value,
      wardCode: "",
    }));
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationResult = logoFileSchema.safeParse(file);
    if (!validationResult.success) {
      toast.error(
        validationResult.error.issues[0]?.message || "Logo công ty không hợp lệ",
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return previewUrl;
    });
    setIsLogoSubmitting(true);

    try {
      const updatedCompany = await updateCompanyLogo(params.id, file);
      setCompany(updatedCompany);
      setLogoPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return "";
      });
      toast.success("Đã cập nhật logo công ty");
      router.refresh();
    } catch (error) {
      setLogoPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return "";
      });
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật logo công ty",
      );
    } finally {
      setIsLogoSubmitting(false);
    }
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
      await updateCompany(params.id, buildPayload(form));
      toast.success("Đã cập nhật hồ sơ công ty thành công");
      router.push(`/recruiter/company/list`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật hồ sơ công ty",
      );
    } finally {
      setIsSubmitting(false);

    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
          <p className="text-sm font-medium text-(--gray-500)">
            Đang tải thông tin công ty...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/recruiter/company/${params.id}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-(--primary-blue) hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại chi tiết
          </Link>
          <h1 className="mt-3 text-2xl font-black text-(--gray-900)">
            Sửa hồ sơ công ty
          </h1>
          <p className="mt-1 text-sm text-(--gray-500)">
            Cập nhật thông tin doanh nghiệp dùng cho tuyển dụng.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-white p-5 shadow-sm sm:p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Logo công ty" icon={Building2}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-(--gray-200) bg-(--blue-light)">
                {logoPreviewUrl || company?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreviewUrl || company?.logoUrl}
                    alt={`${form.name || "Công ty"} logo`}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-10 w-10 text-(--primary-blue)" />
                  </div>
                )}
                <label
                  htmlFor="companyLogo"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Sửa logo công ty"
                >
                  {isLogoSubmitting ? (
                    <CircleDashed className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </label>
                <input
                  id="companyLogo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={isLogoSubmitting}
                  onChange={handleLogoChange}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-(--gray-900)">
                  {form.name || "Logo công ty"}
                </p>
                <p className="text-sm text-(--gray-500)">
                  PNG, JPG, WEBP. Tối đa 5MB.
                </p>
              </div>
            </div>
          </FormSection>

          <FormSection title="Thông tin cơ bản" icon={Building2}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Tên công ty" htmlFor="name" required>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <Field label="Tên viết tắt" htmlFor="shortName">
                <Input
                  id="shortName"
                  value={form.shortName}
                  onChange={(event) =>
                    setField("shortName", event.target.value)
                  }
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
                />
              </Field>
              <Field label="Quy mô công ty" htmlFor="companySize" required>
                <select
                  id="companySize"
                  value={form.companySize}
                  onChange={(event) =>
                    setField("companySize", event.target.value as CompanySize)
                  }
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
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
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                />
              </IconField>
              <IconField icon={Phone} label="Số điện thoại" htmlFor="phone">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                />
              </IconField>
              <IconField icon={ReceiptText} label="Mã số thuế" htmlFor="taxCode">
                <Input
                  id="taxCode"
                  value={form.taxCode}
                  onChange={(event) => setField("taxCode", event.target.value)}
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                />
              </IconField>
              <IconField icon={Globe} label="Website" htmlFor="website">
                <Input
                  id="website"
                  value={form.website}
                  onChange={(event) => setField("website", event.target.value)}
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                />
              </IconField>
            </div>
          </FormSection>

          <FormSection title="Địa chỉ" icon={MapPin}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Tỉnh/thành phố" htmlFor="provinceCode" required>
                <select
                  id="provinceCode"
                  value={form.provinceCode}
                  onChange={(event) => handleProvinceChange(event.target.value)}
                  disabled={isLoadingProvinces}
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                  className="h-11 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 text-sm font-medium text-(--gray-900) outline-none disabled:opacity-60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50"
              />
            </Field>

            {selectedProvince || selectedWard || form.address ? (
              <p className="rounded-xl border border-(--gray-200) bg-(--gray-100)/60 px-3 py-2 text-sm font-medium text-(--gray-700)">
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
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                />
              </IconField>
              <IconField icon={LinkIcon} label="Facebook" htmlFor="facebookUrl">
                <Input
                  id="facebookUrl"
                  value={form.facebookUrl}
                  onChange={(event) =>
                    setField("facebookUrl", event.target.value)
                  }
                  className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/50 pl-10"
                />
              </IconField>
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
                className="min-h-32 w-full rounded-xl border border-(--gray-200) bg-(--gray-100)/50 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
          </FormSection>

          <div className="flex justify-end">
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
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
        {children}
      </div>
    </Field>
  );
}

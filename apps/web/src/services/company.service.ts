import { protectedFetchJson } from "@/services/auth.service";
import type {
  CompanyProfile,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/types/company";

function appendIfDefined(formData: FormData, key: string, value?: string) {
  if (value) {
    formData.append(key, value);
  }
}

function toCreateCompanyFormData(
  payload: CreateCompanyPayload,
  logoFile: File,
): FormData {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("companySize", payload.companySize);
  formData.append("location", JSON.stringify(payload.location));
  formData.append("logoUrl", logoFile);

  appendIfDefined(formData, "shortName", payload.shortName);
  appendIfDefined(formData, "email", payload.email);
  appendIfDefined(formData, "phone", payload.phone);
  appendIfDefined(formData, "taxCode", payload.taxCode);
  appendIfDefined(formData, "companyType", payload.companyType);
  appendIfDefined(formData, "website", payload.website);
  appendIfDefined(formData, "linkedinUrl", payload.linkedinUrl);
  appendIfDefined(formData, "facebookUrl", payload.facebookUrl);
  appendIfDefined(formData, "description", payload.description);

  return formData;
}

export async function createCompany(
  payload: CreateCompanyPayload,
  logoFile?: File | null,
) {
  if (logoFile) {
    return protectedFetchJson<CompanyProfile>(
      "/company/create-company",
      {
        method: "POST",
        body: toCreateCompanyFormData(payload, logoFile),
      },
      "Không thể tạo hồ sơ công ty",
    );
  }

  return protectedFetchJson<CompanyProfile>(
    "/company/create-company",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo hồ sơ công ty",
  );
}

export async function getMyCompany() {
  return protectedFetchJson<CompanyProfile[]>(
    "/company/my-company",
    {
      method: "GET",
    },
    "Không thể tải hồ sơ công ty của bạn",
  );
}
export async function getCompanyById(companyId: string) {
  return protectedFetchJson<CompanyProfile>(
    `/company/${companyId}`,
    {
      method: "GET",
    },
    "Không thể tải hồ sơ công ty",
  );
}
export async function getCompanyByRecruiterId(recruiterId: string) {
  return protectedFetchJson<CompanyProfile[]>(
    `/company/${recruiterId}/company`,
    {
      method: "GET",
    },
    "Không thể tải hồ sơ công ty theo recruiterId",
  );
}

export async function updateCompany(
  companyId: string,
  payload: UpdateCompanyPayload,
) {
  return protectedFetchJson<CompanyProfile>(
    `/company/${companyId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật hồ sơ công ty",
  );
}

export async function updateCompanyLogo(companyId: string, logoFile: File) {
  const formData = new FormData();
  formData.append("logo", logoFile);

  return protectedFetchJson<CompanyProfile>(
    `/company/${companyId}/logo`,
    {
      method: "PATCH",
      body: formData,
    },
    "Không thể cập nhật logo công ty",
  );
}

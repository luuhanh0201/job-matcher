export type CompanySize = "1-10" | "11-50" | "51-200" | "200+";
export type CompanyStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED";

export type CompanyLocationPayload = {
  provinceCode: string;
  wardCode: string;
  address?: string;
};

export type CreateCompanyPayload = {
  name: string;
  shortName?: string;
  logoUrl?: string;
  companySize: CompanySize;
  email?: string;
  phone?: string;
  taxCode?: string;
  companyType?: string;
  website?: string;
  location: CompanyLocationPayload;
  linkedinUrl?: string;
  facebookUrl?: string;
  description?: string;
};

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export type CompanyLocation = {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  address?: string;
};

export type UserSummary = {
  id: string;
  name: string;
  email: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  companySize: CompanySize;
  email?: string;
  phone?: string;
  taxCode?: string;
  companyType?: string;
  website?: string;
  location?: CompanyLocation | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  description?: string | null;
  isVerified: boolean;
  status: CompanyStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy?: UserSummary | null;
};

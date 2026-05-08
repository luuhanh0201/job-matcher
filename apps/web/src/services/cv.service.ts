import { protectedFetchJson } from "@/services/auth.service";

export enum CvProcessingRequestStatus {
  PENDING = "pending",
  NOT_FOUND = "not_found",
}

export enum CvProcessingState {
  WAITING = "waiting",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  DELAYED = "delayed",
  PAUSED = "paused",
  WAITING_CHILDREN = "waiting-children",
}

export enum CvProcessingResultStatus {
  COMPLETED = "completed",
  FAILED = "failed",
}

export type CvRecord = {
  id: number;
  [key: string]: unknown;
};

export type CvPayload = Record<string, unknown>;

export type ParsedCvForm = {
  candidateName?: string;
  email?: string;
  phone?: string;
  totalExperienceYears?: string;
  currentTitle?: string;
  skills?: string;
  education?: string;
  workExperience?: string;
  certifications?: string;
  languages?: string;
};

export type UploadCvResponse = {
  cv: CvRecord;
  cvId: string;
  status: CvProcessingRequestStatus;
  message: string;
};

export type CvProcessingStatus = {
  id?: string;
  name?: string;
  state?: CvProcessingState;
  progress?: number;
  data?: { cvDocumentId?: string };
  parsedData?: ParsedCvForm | null;
  result?: {
    cvDocumentId?: string;
    status?: CvProcessingResultStatus;
    parsedData?: ParsedCvForm;
  };
  failedReason?: string | null;
  attemptsMade?: number;
  status?: CvProcessingRequestStatus;
};

export async function getCvList() {
  return protectedFetchJson<CvRecord[]>(
    "/cv",
    {
      method: "GET",
    },
    "Không thể tải danh sách CV",
  );
}

export async function getCvById(id: number) {
  return protectedFetchJson<CvRecord>(
    `/cv/${id}`,
    {
      method: "GET",
    },
    "Không thể tải chi tiết CV",
  );
}

export async function createCv(payload: CvPayload) {
  return protectedFetchJson<CvRecord>(
    "/cv",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo CV",
  );
}

export async function updateCv(id: number, payload: CvPayload) {
  return protectedFetchJson<CvRecord>(
    `/cv/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật CV",
  );
}

export async function deleteCv(id: number) {
  return protectedFetchJson<{ message?: string }>(
    `/cv/${id}`,
    {
      method: "DELETE",
    },
    "Không thể xóa CV",
  );
}

export async function uploadCvFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return protectedFetchJson<UploadCvResponse>(
    "/cv/upload",
    {
      method: "POST",
      body: formData,
    },
    "Không thể upload CV",
  );
}

export async function getCvProcessingStatus(cvId: string) {
  return protectedFetchJson<CvProcessingStatus>(
    `/cv-processing/cv/${cvId}/status`,
    {
      method: "GET",
    },
    "Không thể lấy trạng thái xử lý CV",
  );
}

export async function saveParsedCv(payload: ParsedCvForm & { cvId: string }) {
  return protectedFetchJson<CvRecord>(
    "/cv/save-parsed-cv",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể lưu dữ liệu CV đã chỉnh sửa",
  );
}

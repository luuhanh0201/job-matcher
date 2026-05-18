import { protectedFetchJson } from "@/services/auth.service";
import { getOrCreateDeviceId } from "@/lib/device-id";
import type {
  AnalyzerResult,
  CvPayload,
  CvProcessingStatus,
  CvRecord,
  ExtractedCvData,
  ParsedCvForm,
  UploadCvResponse,
} from "@/types/cv";

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
      headers: {
        "x-device-id": getOrCreateDeviceId(),
      },
      body: formData,
    },
    "Không thể upload CV",
  );
}

export async function extractCvFromText(cvText: string) {
  return protectedFetchJson<ExtractedCvData>(
    "/ai/extract-cv",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cvText }),
    },
    "Không thể trích xuất dữ liệu từ CV",
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

export async function analyzeCv(cvData: ExtractedCvData) {
  return protectedFetchJson<AnalyzerResult>(
    "/ai/analyze-cv",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": getOrCreateDeviceId(),
      },
      body: JSON.stringify(cvData),
    },
    "Không thể phân tích CV",
  );
}

import { protectedFetchJson } from "@/services/auth.service";
import type {
  AiProvider,
  CreateAiProviderPayload,
  UpdateAiProviderPayload,
} from "@/types/ai-provider";

export async function getAiProviders() {
  return protectedFetchJson<AiProvider[]>(
    "/admin/ai-providers",
    { method: "GET" },
    "Không thể tải danh sách AI Provider",
  );
}

export async function createAiProvider(payload: CreateAiProviderPayload) {
  return protectedFetchJson<AiProvider>(
    "/admin/ai-providers",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Không thể thêm AI Provider",
  );
}

export async function updateAiProvider(
  id: string,
  payload: UpdateAiProviderPayload,
) {
  return protectedFetchJson<AiProvider>(
    `/admin/ai-providers/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật AI Provider",
  );
}

export async function activateAiProvider(id: string) {
  return protectedFetchJson<AiProvider>(
    `/admin/ai-providers/${id}/activate`,
    { method: "PATCH" },
    "Không thể kích hoạt AI Provider",
  );
}

export async function deleteAiProvider(id: string) {
  return protectedFetchJson<{ message: string }>(
    `/admin/ai-providers/${id}`,
    { method: "DELETE" },
    "Không thể xoá AI Provider",
  );
}

export async function testAiProviderConnection(id: string) {
  return protectedFetchJson<{ success: boolean; message: string }>(
    `/admin/ai-providers/${id}/test-connection`,
    { method: "POST" },
    "Không thể kiểm tra kết nối AI Provider",
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { BsRobot } from "react-icons/bs";
import {
  activateAiProvider,
  createAiProvider,
  deleteAiProvider,
  getAiProviders,
  testAiProviderConnection,
} from "@/services/ai-provider.service";
import type { AiProvider, AiProviderVendor } from "@/types/ai-provider";
import { AiSectionTabs } from "../ai-section-tabs";

const VENDOR_OPTIONS: { value: AiProviderVendor; label: string }[] = [
  { value: "ANTHROPIC", label: "Anthropic (Claude)" },
  { value: "OPENAI", label: "OpenAI (GPT)" },
  { value: "GEMINI", label: "Google Gemini" },
  { value: "GROQ", label: "Groq" },
];

const VENDOR_BADGE_CLASS: Record<AiProviderVendor, string> = {
  ANTHROPIC: "bg-orange-100 text-orange-700",
  OPENAI: "bg-emerald-100 text-emerald-700",
  GEMINI: "bg-indigo-100 text-indigo-700",
  GROQ: "bg-rose-100 text-rose-700",
};

type FormState = {
  name: string;
  vendor: AiProviderVendor;
  model: string;
  apiKey: string;
  maxTokens: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  vendor: "ANTHROPIC",
  model: "",
  apiKey: "",
  maxTokens: "1024",
};

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "Chưa kiểm tra";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

export default function AdminAiProvidersPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await getAiProviders();
      setProviders(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải danh sách AI Provider");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error("Vui lòng nhập tên gợi nhớ cho AI Provider"); return; }
    if (!form.model.trim()) { toast.error("Vui lòng nhập model"); return; }
    if (!form.apiKey.trim()) { toast.error("Vui lòng nhập API key"); return; }

    const maxTokens = form.maxTokens ? Number(form.maxTokens) : undefined;
    if (maxTokens !== undefined && (!Number.isInteger(maxTokens) || maxTokens <= 0)) {
      toast.error("Max tokens phải là số nguyên dương");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAiProvider({
        name: form.name.trim(),
        vendor: form.vendor,
        model: form.model.trim(),
        apiKey: form.apiKey.trim(),
        maxTokens,
      });
      if (created.lastCheckStatus === "FAILED") {
        toast.warning(
          `Đã lưu "${created.name}" nhưng kiểm tra kết nối thất bại: ${created.lastCheckMessage ?? "không rõ nguyên nhân"}`,
        );
      } else {
        toast.success("Đã thêm AI Provider mới và kiểm tra kết nối thành công");
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể thêm AI Provider");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (provider: AiProvider) => {
    if (provider.isActive) return;
    setPendingActionId(provider.id);
    try {
      await activateAiProvider(provider.id);
      toast.success(`Đã kích hoạt "${provider.name}" cho toàn hệ thống`);
      await loadProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể kích hoạt AI Provider");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleTestConnection = async (provider: AiProvider) => {
    setTestingId(provider.id);
    try {
      const result = await testAiProviderConnection(provider.id);
      if (result.success) {
        toast.success(`${provider.name}: ${result.message}`);
      } else {
        toast.error(`${provider.name}: ${result.message}`);
      }
      await loadProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể kiểm tra kết nối");
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (provider: AiProvider) => {
    if (provider.isActive) return;
    if (!confirm(`Xoá AI Provider "${provider.name}"? Hành động này không thể hoàn tác.`)) return;

    setPendingActionId(provider.id);
    try {
      await deleteAiProvider(provider.id);
      toast.success("Đã xoá AI Provider");
      await loadProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xoá AI Provider");
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-(--gray-900)">
            <BsRobot className="h-6 w-6 text-indigo-600" />
            Quản lý AI
          </h1>
          <p className="text-sm text-(--gray-600)">
            Thêm nhà cung cấp AI bằng API key và chọn 1 AI đang dùng cho toàn hệ thống.
          </p>
        </div>
        <Button
          className="w-full gap-2 sm:w-auto bg-(--primary-blue) text-white hover:bg-(--blue-dark)"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <Plus className="h-4 w-4" />
          Thêm AI
        </Button>
      </div>

      <AiSectionTabs />

      {showForm && (
        <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-(--gray-900)">Thêm AI Provider</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ai-name">Tên gợi nhớ</Label>
              <Input
                id="ai-name"
                placeholder="Vd: Anthropic Production"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-vendor">Nhà cung cấp</Label>
              <select
                id="ai-vendor"
                value={form.vendor}
                onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value as AiProviderVendor }))}
                className="h-8 w-full rounded-lg border border-(--gray-200) bg-white px-2.5 text-sm outline-none focus:border-(--primary-blue) focus:ring-2 focus:ring-(--primary-blue)/20"
              >
                {VENDOR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-model">Model</Label>
              <Input
                id="ai-model"
                placeholder="Vd: claude-sonnet-4-5, gpt-4o, gemini-1.5-pro"
                value={form.model}
                onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-max-tokens">Max tokens</Label>
              <Input
                id="ai-max-tokens"
                type="number"
                min={1}
                value={form.maxTokens}
                onChange={(e) => setForm((prev) => ({ ...prev, maxTokens: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ai-api-key">API key</Label>
              <div className="relative">
                <Input
                  id="ai-api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Dán API key của nhà cung cấp"
                  value={form.apiKey}
                  onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-(--gray-500) hover:text-(--gray-700)"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-(--gray-500)">
                API key được mã hoá trước khi lưu, không thể xem lại sau khi lưu. Hệ thống sẽ tự kiểm tra kết nối ngay sau khi lưu.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSubmitting} className="bg-(--primary-blue) text-white hover:bg-(--blue-dark)">
                {isSubmitting ? "Đang lưu..." : "Lưu AI Provider"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                Huỷ
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="border border-(--gray-200) bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
          </div>
        ) : providers.length === 0 ? (
          <div className="py-12 text-center text-sm text-(--gray-500)">
            Chưa có AI Provider nào. Bấm &quot;Thêm AI&quot; để bắt đầu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--gray-200) bg-(--gray-50)">
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Tên</th>
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Model</th>
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">API key</th>
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Kết nối</th>
                  <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-b border-(--gray-200) transition-colors hover:bg-(--gray-50)">
                    <td className="px-4 py-3 font-medium text-(--gray-900)">{provider.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${VENDOR_BADGE_CLASS[provider.vendor]}`}>
                        {provider.vendor}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-(--gray-600)">{provider.model}</td>
                    <td className="px-4 py-3 font-mono text-xs text-(--gray-500)">{provider.maskedApiKey}</td>
                    <td className="px-4 py-3">
                      {provider.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đang dùng
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-(--gray-100) px-2 py-1 text-xs font-medium text-(--gray-600)">
                          Chưa kích hoạt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {provider.lastCheckStatus === "SUCCESS" && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                          title={provider.lastCheckedAt ? new Date(provider.lastCheckedAt).toLocaleString("vi-VN") : ""}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã kết nối
                        </span>
                      )}
                      {provider.lastCheckStatus === "FAILED" && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                          title={provider.lastCheckMessage ?? ""}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Lỗi kết nối
                        </span>
                      )}
                      {provider.lastCheckStatus === "UNKNOWN" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--gray-100) px-2 py-1 text-xs font-medium text-(--gray-600)">
                          <HelpCircle className="h-3.5 w-3.5" />
                          Chưa kiểm tra
                        </span>
                      )}
                      <div className="mt-1 text-[10px] text-(--gray-400)">
                        {formatRelativeTime(provider.lastCheckedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          disabled={testingId === provider.id}
                          title="Kiểm tra kết nối"
                          onClick={() => handleTestConnection(provider)}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${testingId === provider.id ? "animate-spin" : ""}`} />
                        </Button>
                        {!provider.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={pendingActionId === provider.id}
                            onClick={() => handleActivate(provider)}
                          >
                            Kích hoạt
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={provider.isActive || pendingActionId === provider.id}
                          title={provider.isActive ? "Không thể xoá AI Provider đang dùng" : "Xoá"}
                          onClick={() => handleDelete(provider)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

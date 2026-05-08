"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Check, CircleDashed, FileText, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CvProcessingState,
  CvProcessingStatus,
  ParsedCvForm,
  getCvProcessingStatus,
  saveParsedCv,
  uploadCvFile,
} from "@/services/cv.service";

const DEFAULT_FORM: ParsedCvForm = {
  candidateName: "",
  email: "",
  phone: "",
  totalExperienceYears: "",
  currentTitle: "",
  skills: "",
  education: "",
  workExperience: "",
  certifications: "",
  languages: "",
};

function pickParsedData(status: CvProcessingStatus): ParsedCvForm | null {
  const topLevel = status.parsedData;
  if (topLevel && typeof topLevel === "object") return topLevel;

  const direct = status.result?.parsedData;
  if (direct && typeof direct === "object") return direct;

  const unknownResult = status.result as unknown as
    | Record<string, unknown>
    | undefined;
  const nested = unknownResult?.data as Record<string, unknown> | undefined;
  const nestedParsed = nested?.parsedData;
  if (nestedParsed && typeof nestedParsed === "object") {
    return nestedParsed as ParsedCvForm;
  }

  const candidateLike = unknownResult as ParsedCvForm | undefined;
  if (
    candidateLike &&
    (candidateLike.candidateName ||
      candidateLike.email ||
      candidateLike.phone ||
      candidateLike.skills ||
      candidateLike.education ||
      candidateLike.workExperience)
  ) {
    return candidateLike;
  }

  return null;
}

function extractSkillTags(skills?: string) {
  if (!skills) return [];

  const tags = skills
    .replace(/\n/g, ",")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.length > 1);

  return Array.from(new Set(tags)).slice(0, 8);
}

function getStepState(
  step: number,
  options: {
    hasCvProcessing: boolean;
    progress: number;
    hasParsedData: boolean;
    hasAiAnalysis: boolean;
    hasSuggestedJobs: boolean;
  },
) {
  const { hasCvProcessing, progress, hasParsedData, hasAiAnalysis, hasSuggestedJobs } = options;

  if (step === 1) return hasCvProcessing ? "done" : "idle";

  if (step === 2) {
    if (!hasCvProcessing) return "idle";
    if (progress >= 50 || hasParsedData) return "done";
    return "active";
  }

  if (step === 3) {
    if (hasParsedData) return "done";
    if (hasCvProcessing && progress >= 50) return "active";
    return "idle";
  }

  if (step === 4) return hasAiAnalysis ? "done" : "idle";
  if (step === 5) return hasSuggestedJobs ? "done" : "idle";

  return "idle";
}

export default function AiCvPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cvId, setCvId] = useState("");
  const [cvProcessingStatus, setCvProcessingStatus] = useState<CvProcessingStatus | null>(null);
  const [form, setForm] = useState<ParsedCvForm>(DEFAULT_FORM);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canSave = useMemo(() => Boolean(cvId.trim()), [cvId]);
  const progress = Number(cvProcessingStatus?.progress ?? 0);
  const score = Math.min(98, Math.max(40, progress > 0 ? progress : 86));
  const skillTags = useMemo(() => extractSkillTags(form.skills), [form.skills]);
  const hasParsedData = Boolean(
    cvProcessingStatus ? pickParsedData(cvProcessingStatus) : null,
  );
  const resultData = cvProcessingStatus?.result as
    | Record<string, unknown>
    | undefined;
  const hasAiAnalysis = Boolean(resultData?.aiAnalysis);
  const hasSuggestedJobs = Array.isArray(resultData?.suggestedJobs)
    ? resultData.suggestedJobs.length > 0
    : false;

  const steps = [
    { id: 1, title: "Tải lên", subtitle: "CV đã tải lên" },
    { id: 2, title: "Đọc PDF", subtitle: "Đọc nội dung" },
    { id: 3, title: "Trích xuất", subtitle: "Trích xuất kỹ năng" },
    { id: 4, title: "Phân tích", subtitle: "AI đánh giá (chưa tích hợp)" },
    { id: 5, title: "Gợi ý việc", subtitle: "Gợi ý việc làm (chưa tích hợp)" },
  ];

  const summaryText =
    form.currentTitle || form.skills || form.workExperience
      ? `Bạn có nền tảng ${form.currentTitle || "đang phát triển"}. Hãy rà soát kỹ kỹ năng và kinh nghiệm để hệ thống match việc làm chính xác hơn.`
      : "Tải CV lên để AI phân tích kỹ năng, kinh nghiệm và gợi ý công việc phù hợp.";

  const setField = (key: keyof ParsedCvForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncCvStatus = async (currentCvId: string) => {
    const status = await getCvProcessingStatus(currentCvId);
    const nextStatus =
      status.state === "completed" ? { ...status, progress: 100 } : status;

    setCvProcessingStatus(nextStatus);

    const parsedData = pickParsedData(status);
    if (parsedData) {
      setForm((prev) => ({ ...prev, ...parsedData }));
    }

    if (status.state === "completed" && parsedData) {
      setMessage("Phân tích CV hoàn tất. Bạn có thể chỉnh sửa dữ liệu và xác nhận lưu.");
    }
    if (status.state === "failed") {
      setError(status.failedReason || "Xử lý CV thất bại.");
    }

    return {
      status,
      parsedData,
    };
  };

  const pollCvUntilDone = async (currentCvId: string) => {
    const maxAttempts = 40;
    const delayMs = 1500;
    let transientErrorCount = 0;
    let completedWithoutDataAttempts = 0;

    for (let i = 0; i < maxAttempts; i += 1) {
      try {
        const { status, parsedData } = await syncCvStatus(currentCvId);
        transientErrorCount = 0;

        if (status.state === "failed") {
          return;
        }

        if (status.state === "completed" && parsedData) {
          return;
        }

        if (status.state === "completed" && !parsedData) {
          completedWithoutDataAttempts += 1;
          setMessage("Đã hoàn tất xử lý, đang đồng bộ dữ liệu parse...");
          if (completedWithoutDataAttempts >= 6) {
            setError("Hoàn tất xử lý nhưng chưa nhận được dữ liệu parse. Vui lòng thử lại.");
            return;
          }
        }
      } catch {
        transientErrorCount += 1;
        if (transientErrorCount >= 3) {
          setMessage("Kết nối trạng thái CV không ổn định, đang tự thử lại...");
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    setMessage("CV đang được xử lý. Dữ liệu sẽ tự cập nhật khi parse xong.");
  };

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      // Ensure selecting the same file again still triggers onChange.
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file PDF trước khi upload.");
      return;
    }

    setUploadLoading(true);
    setError("");
    setMessage("");

    let currentCvId = "";
    try {
      const response = await uploadCvFile(file);
      currentCvId = response.cvId ?? String(response.cv?.id ?? "");
      setCvId(currentCvId);
      setCvProcessingStatus({
        state: CvProcessingState.WAITING,
        progress: 10,
      });
      setMessage(response.message || "Upload thành công. CV đang được xử lý.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload CV thất bại.");
      setUploadLoading(false);
      return;
    }

    setUploadLoading(false);

    if (!currentCvId) return;

    setPollLoading(true);
    try {
      await pollCvUntilDone(currentCvId);
    } catch {
      setError("Không thể đồng bộ trạng thái xử lý CV. Vui lòng thử lại.");
    } finally {
      setPollLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cvId) {
      setError("Chưa có cvId để lưu dữ liệu.");
      return;
    }

    setSaveLoading(true);
    setError("");

    try {
      await saveParsedCv({ cvId, ...form });
      setMessage("Lưu dữ liệu CV đã chỉnh sửa thành công.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu dữ liệu CV đã chỉnh sửa.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-(--gray-200) bg-white/90 shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          <div className="rounded-3xl border border-(--gray-200) bg-gradient-to-r from-(--blue-light) via-white to-(--blue-light)/60 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center rounded-full bg-(--accent-purple)/10 px-3 py-1 text-xs font-bold tracking-wide text-(--accent-purple)">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> AI CV PHÂN TÍCH
                </span>
                <h1 className="text-3xl leading-tight font-black text-(--gray-900)">
                  Tìm công việc phù hợp hơn với{" "}
                  <span className="text-(--accent-purple)">Job Matcher AI</span>
                </h1>
                <p className="text-sm text-(--gray-500)">
                  Tải CV PDF lên, hệ thống sẽ trích xuất kỹ năng, phân tích điểm mạnh/yếu và
                  gợi ý các công việc phù hợp nhất với hồ sơ của bạn.
                </p>
              </div>

              <div className="grid h-24 w-24 place-items-center rounded-full border border-(--gray-200) bg-white shadow-sm">
                <div className="text-center">
                  <p className="text-4xl leading-none font-black text-(--accent-green)">{score}%</p>
                  <p className="mt-1 text-[11px] font-semibold text-(--gray-500)">Điểm phù hợp</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-dashed border-(--primary-blue)/35 bg-white px-4 py-4 sm:px-5">
              <Input
                ref={fileInputRef}
                id="cv-file"
                type="file"
                accept="application/pdf"
                onChange={handleSelectFile}
                className="sr-only"
              />

              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFilePicker();
                  }
                }}
                className="group flex min-h-[148px] w-full flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-(--primary-blue)/30 bg-(--blue-light)/35 px-4 py-5 transition-all duration-200 hover:border-(--primary-blue)/60 hover:bg-(--blue-light)/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-blue)/40"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
                    <FileText className="h-8 w-8 text-(--primary-blue)" />
                  </div>
                  <div>
                    <p className="font-bold text-(--gray-900)">Kéo thả CV PDF hoặc chọn file</p>
                    <p className="text-sm text-(--gray-500)">
                      Chỉ hỗ trợ PDF - tối đa 5MB - phân tích kỹ năng, kinh nghiệm và gợi ý job trong vài bước.
                    </p>
                    <p className="mt-1 text-xs font-semibold text-(--primary-blue)">
                      {file?.name ? `Đã chọn: ${file.name}` : "Bấm vào bất kỳ vị trí nào trong khung để chọn file"}
                    </p>
                  </div>
                </div>

                <div
                  className="flex h-full items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleUpload();
                    }}
                    disabled={uploadLoading || pollLoading}
                    className="h-10 cursor-pointer rounded-full bg-gradient-to-r from-(--accent-purple) to-(--primary-blue) px-12 py-6 font-bold text-white  transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110  active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 text-[16px] "
                  >
                    {uploadLoading ? "Đang upload..." : "Phân tích CV"}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-(--gray-500)">
                {pollLoading ? "Đang tự động xử lý và cập nhật dữ liệu parse..." : null}
                {pollLoading ? " " : ""}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step) => {
                const state = getStepState(step.id, {
                  hasCvProcessing: Boolean(cvId),
                  progress,
                  hasParsedData,
                  hasAiAnalysis,
                  hasSuggestedJobs,
                });
                const isDone = state === "done";
                const isActive = state === "active";

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border px-3 py-3 transition-colors ${
                      isDone
                        ? "border-(--accent-green)/40 bg-(--accent-green)/10"
                        : isActive
                          ? "border-(--accent-purple)/40 bg-(--accent-purple)/10"
                          : "border-(--gray-200) bg-white"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-(--accent-green) text-white"
                            : isActive
                              ? "bg-(--accent-purple) text-white"
                              : "bg-(--gray-200) text-(--gray-500)"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                      </span>
                      <p className="font-bold text-(--gray-900)">{step.title}</p>
                    </div>
                    <p className="text-xs text-(--gray-500)">{step.subtitle}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-(--gray-200) bg-white p-4">
                <p className="mb-3 text-lg font-bold text-(--gray-900)">Hồ sơ CV</p>

                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--accent-purple)/15 text-lg font-black text-(--accent-purple)">
                    {(form.candidateName || "CV")
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() || "")
                      .join("") || "CV"}
                  </div>
                  <div>
                    <p className="font-black text-(--gray-900)">
                      {form.candidateName || "Chưa có thông tin ứng viên"}
                    </p>
                    <p className="text-sm text-(--gray-500)">
                      Vị trí gợi ý: {form.currentTitle || "Chưa xác định"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillTags.length > 0 ? (
                    skillTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-(--blue-light) px-3 py-1 text-xs font-bold text-(--primary-blue)"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-(--gray-500)">Chưa có kỹ năng. Hãy upload CV và phân tích.</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-(--gray-200) bg-white p-4">
                <p className="mb-2 text-lg font-bold text-(--gray-900)">Tóm tắt AI</p>
                <p className="text-sm text-(--gray-500)">{summaryText}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {form.skills ? (
                    <span className="rounded-full bg-(--accent-green)/15 px-3 py-1 text-xs font-bold text-(--accent-green)">
                      Đã trích xuất kỹ năng
                    </span>
                  ) : null}
                  {form.workExperience ? (
                    <span className="rounded-full bg-(--accent-green)/15 px-3 py-1 text-xs font-bold text-(--accent-green)">
                      Có kinh nghiệm
                    </span>
                  ) : null}
                  {!form.totalExperienceYears ? (
                    <span className="rounded-full bg-(--accent-orange)/15 px-3 py-1 text-xs font-bold text-(--accent-orange)">
                      Thiếu tổng số năm kinh nghiệm
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {message ? (
              <div className="mt-3 rounded-xl border border-(--accent-green)/30 bg-(--accent-green)/10 px-3 py-2 text-sm text-(--gray-900)">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-(--accent-orange)/30 bg-(--accent-orange)/10 px-3 py-2 text-sm text-(--gray-900)">
                <TriangleAlert className="mt-0.5 h-4 w-4 text-(--accent-orange)" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-(--gray-200) bg-white/95">
        <CardHeader>
          <CardTitle className="text-(--gray-900)">Xác nhận dữ liệu parse</CardTitle>
          <CardDescription>
            Parsing không thể đúng 100% cho mọi CV. Hãy chỉnh sửa trước khi xác nhận lưu.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              value={form.candidateName ?? ""}
              onChange={(e) => setField("candidateName", e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={form.email ?? ""}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone ?? ""}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="currentTitle">Current Title</Label>
              <Input
                id="currentTitle"
                value={form.currentTitle ?? ""}
                onChange={(e) => setField("currentTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalExperienceYears">Total Experience Years</Label>
              <Input
                id="totalExperienceYears"
                value={form.totalExperienceYears ?? ""}
                onChange={(e) => setField("totalExperienceYears", e.target.value)}
              />
            </div>
          </div>

          {(
            [
              ["skills", "Skills"],
              ["education", "Education"],
              ["workExperience", "Work Experience"],
              ["certifications", "Certifications"],
              ["languages", "Languages"],
            ] as Array<[keyof ParsedCvForm, string]>
          ).map(([key, label]) => (
            <div key={key} className="grid gap-2">
              <Label htmlFor={key}>{label}</Label>
              <textarea
                id={key}
                className="min-h-22 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={form[key] ?? ""}
                onChange={(e) => setField(key, e.target.value)}
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={!canSave || saveLoading}
              className="cursor-pointer rounded-full bg-(--primary-blue) px-5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--blue-dark) active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveLoading ? (
                <>
                  <CircleDashed className="mr-1.5 h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                "Xác nhận và lưu"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setForm(DEFAULT_FORM)}
              disabled={saveLoading}
              className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Đặt lại form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
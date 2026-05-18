"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Check, CircleDashed, FileText, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  analyzeCv,
  extractCvFromText,
  uploadCvFile,
} from "@/services/cv.service";
import { CvProcessingState } from "@/types/cv";
import type { AnalyzerResult, CvProcessingStatus, ExtractedCvData, ParsedCvForm } from "@/types/cv";
import FormConfirmCvComponent, { DEFAULT_FORM } from "./formConfirmCv";
import AiResultCard from "./aiResultCard";
import ResumeProfile from "./resumeProfile";





function normalizeList(values: string[]) {
  return values.join(", ");
}

function normalizeEducation(
  education: ExtractedCvData["education"],
) {
  return education
    .map((item) =>
      [item.school, item.degree, item.major, item.time]
        .filter(Boolean)
        .join(" | "),
    )
    .filter(Boolean)
    .join("\n");
}

function normalizeWorkExperience(
  workExperience: ExtractedCvData["workExperience"],
) {
  return workExperience
    .map((item) =>
      [item.company, item.position, item.time, item.description]
        .filter(Boolean)
        .join(" | "),
    )
    .filter(Boolean)
    .join("\n");
}





function toParsedCvForm(data: ExtractedCvData): ParsedCvForm {
  return {
    candidateName: data.candidateName,
    currentTitle: data.currentTitle,
    email: data.email,
    phone: data.phone,
    totalExperienceYears: data.totalExperienceYears,
    skills: normalizeList(data.skills),
    education: normalizeEducation(data.education),
    workExperience: normalizeWorkExperience(data.workExperience),
    certifications: normalizeList(data.certifications),
    languages: normalizeList(data.languages),
  };
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
  const [extractedData, setExtractedData] = useState<ExtractedCvData | null>(null);
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const progress = Number(cvProcessingStatus?.progress ?? 0);
  const hasParsedData = Boolean(form.candidateName || form.skills || form.workExperience);
  const hasAiAnalysis = Boolean(analyzerResult);
  const hasSuggestedJobs = false;
  const apiLoadingText = uploadLoading
    ? "Đang tải CV..."
    : pollLoading
      ? "Đang trích xuất dữ liệu từ nội dung CV bằng AI..."
      : analyzeLoading
        ? "Đang phân tích CV bằng AI..."
        : "";


  const steps = [
    { id: 1, title: "Tải lên", subtitle: "CV đã tải lên" },
    { id: 2, title: "Đọc PDF", subtitle: "Đọc nội dung" },
    { id: 3, title: "Trích xuất", subtitle: "Trích xuất thông tin Cv" },
    { id: 4, title: "Phân tích", subtitle: "AI đánh giá" },
    { id: 5, title: "Gợi ý việc", subtitle: "Gợi ý việc làm (chưa tích hợp)" },
  ];

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

    try {
      const response = await uploadCvFile(file);
      const currentCvId = response.cvId ?? String(response.cv?.id ?? "");

      if (!response.parsedText?.trim()) {
        throw new Error("Không đọc được nội dung text từ CV");
      }

      setCvId(currentCvId);
      setCvProcessingStatus({
        state: CvProcessingState.ACTIVE,
        progress: 55,
      });

      setPollLoading(true);
      const extracted = await extractCvFromText(response.parsedText);
      setExtractedData(extracted);
      setForm((prev) => ({
        ...prev,
        ...toParsedCvForm(extracted),
        fileUrl: response.fileUrl ?? (response.cv as Record<string, unknown>)?.fileUrl as string | undefined,
      }));

      setCvProcessingStatus({
        state: CvProcessingState.COMPLETED,
        progress: 100,
      });
      setMessage(response.message || "Upload và trích xuất CV thành công.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload CV thất bại.");
    } finally {
      setUploadLoading(false);
      setPollLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedData) {
      setError("Vui lòng upload và trích xuất CV trước khi phân tích.");
      return;
    }

    setAnalyzeLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await analyzeCv(extractedData);
      setAnalyzerResult(result);
      setMessage("Phân tích CV thành công.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể phân tích CV.");
    } finally {
      setAnalyzeLoading(false);
    }
  };



  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-(--gray-200) bg-white/90 shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          <div className="rounded-3xl border border-(--gray-200) bg-linear-to-r from-(--blue-light) via-white to-(--blue-light)/60 p-4 sm:p-5">
            <div className="mb-4 flex flex-col items-start justify-between gap-4 lg:flex-row">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center rounded-full bg-(--accent-purple)/10 px-3 py-1 text-xs font-bold tracking-wide text-(--accent-purple)">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> AI CV Analyzer
                </span>
                <h1 className="text-2xl leading-tight font-black text-(--gray-900) sm:text-3xl">
                  Tìm công việc phù hợp hơn với{" "}
                  <span className="text-(--accent-purple)">Job Matcher AI</span>
                </h1>
                <p className="text-sm text-(--gray-500)">
                  Tải CV PDF lên, hệ thống sẽ trích xuất kỹ năng, phân tích điểm mạnh/yếu và
                  gợi ý các công việc phù hợp nhất với hồ sơ của bạn.
                </p>
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
                className="group flex min-h-37 w-full flex-col items-start justify-between gap-4 rounded-2xl border-2 border-dashed border-(--primary-blue)/30 bg-(--blue-light)/35 px-4 py-5 transition-all duration-200 hover:border-(--primary-blue)/60 hover:bg-(--blue-light)/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-blue)/40 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3 sm:items-center">
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
                  className="flex w-full justify-start sm:w-auto sm:justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleUpload();
                    }}
                    disabled={uploadLoading || pollLoading}
                    className="h-10 w-full rounded-full bg-linear-to-r from-(--accent-purple) to-(--primary-blue) px-6 py-6 text-[16px] font-bold text-white disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]  disabled:opacity-70 sm:w-auto sm:px-12"
                  >
                    {uploadLoading || pollLoading ? (
                      <>
                        <CircleDashed className="mr-1.5 h-4 w-4 animate-spin" />
                        {uploadLoading ? "Đang upload..." : "Đang trích xuất..."}
                      </>
                    ) : (
                      "Tải CV lên"
                    )}
                  </Button>
                </div>
              </div>

              {apiLoadingText ? (
                <p className="flex items-center gap-2 text-xs font-medium text-(--gray-500)">
                  <CircleDashed className="h-3.5 w-3.5 animate-spin" />
                  <span>{apiLoadingText}</span>
                </p>
              ) : null}
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
                    className={`rounded-2xl border px-3 py-3 transition-colors ${isDone
                      ? "border-(--accent-green)/40 bg-(--accent-green)/10"
                      : isActive
                        ? "border-(--accent-purple)/40 bg-(--accent-purple)/10"
                        : "border-(--gray-200) bg-white"
                      }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${isDone
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
              <ResumeProfile form={form} />

              <AiResultCard form={form} hasParsedData={hasParsedData} analyzerResult={analyzerResult} onAnalyze={handleAnalyze} loading={analyzeLoading} />

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

      {hasParsedData && !hasAiAnalysis ? (
        <FormConfirmCvComponent cvId={cvId} form={form} setForm={setForm} />
      ) : null}
    </div>
  );
}
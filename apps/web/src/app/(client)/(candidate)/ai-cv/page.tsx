"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Check, CircleDashed, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  analyzeCv,
  extractCvFromText,
  getCvList,
  uploadCvFile,
} from "@/services/cv.service";
import { CvProcessingState } from "@/types/cv";
import type {
  AnalyzerResult,
  CvProcessingStatus,
  CvRecord,
  ExtractedCvData,
  ParsedCvForm,
} from "@/types/cv";
import { toParsedCvForm } from "@/utils/cv.utils";
import FormConfirmCvComponent, { DEFAULT_FORM } from "./formConfirmCv";
import AiResultCard from "./aiResultCard";
import ResumeProfile from "./resumeProfile";
import { toast } from "sonner";

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
  const {
    hasCvProcessing,
    progress,
    hasParsedData,
    hasAiAnalysis,
    hasSuggestedJobs,
  } = options;

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
  const formConfirmRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cvId, setCvId] = useState("");
  const [cvProcessingStatus, setCvProcessingStatus] =
    useState<CvProcessingStatus | null>(null);
  const [form, setForm] = useState<ParsedCvForm>(DEFAULT_FORM);
  const [uploadedCvs, setUploadedCvs] = useState<CvRecord[]>([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedCvData | null>(
    null,
  );
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(
    null,
  );
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);

  const progress = Number(cvProcessingStatus?.progress ?? 0);
  const hasCvProcessing = Boolean(cvId && cvProcessingStatus);
  const hasParsedData = Boolean(
    extractedData && (form.candidateName || form.skills || form.workExperience),
  );
  const hasAiAnalysis = Boolean(analyzerResult);
  const hasSuggestedJobs = false;

  const loadUploadedCvs = async () => {
    try {
      const cvs = await getCvList();
      setUploadedCvs(cvs);
      const latestCv = cvs.find((cv) => cv.fileUrl);
      if (latestCv) {
        setSelectedCvId((current) => current || latestCv.id);
        setForm((prev) => ({
          ...prev,
          fileUrl: prev.fileUrl || latestCv.fileUrl,
        }));
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách CV đã upload.",
      );
    }
  };

  useEffect(() => {
    void loadUploadedCvs();
  }, []);

  useEffect(() => {
    if (hasParsedData && !hasAiAnalysis && formConfirmRef.current) {
      setTimeout(() => {
        formConfirmRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  }, [hasParsedData, hasAiAnalysis]);

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
    // Reset all state when selecting a new file
    setCvId("");
    setCvProcessingStatus(null);
    setForm(DEFAULT_FORM);
    setExtractedData(null);
    setAnalyzerResult(null);
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
      toast.error("Vui lòng chọn file PDF trước khi upload.");
      return;
    }

    setUploadLoading(true);
    // Reset processing state at the start
    setCvProcessingStatus(null);
    setExtractedData(null);

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
      const uploadedFileUrl = response.fileUrl ?? response.cv?.fileUrl ?? "";
      setExtractedData(extracted);
      setSelectedCvId(currentCvId);
      if (response.cv) {
        setUploadedCvs((prev) => [
          response.cv,
          ...prev.filter((cv) => cv.id !== response.cv.id),
        ]);
      }
      setForm((prev) => ({
        ...prev,
        ...toParsedCvForm(extracted),
        fileUrl: uploadedFileUrl || prev.fileUrl,
      }));

      setCvProcessingStatus({
        state: CvProcessingState.COMPLETED,
        progress: 100,
      });
      toast.success(response.message || "Upload và trích xuất CV thành công.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload CV thất bại.");
    } finally {
      setUploadLoading(false);
      setPollLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedData) {
      toast.error("Vui lòng upload và trích xuất CV trước khi phân tích.");
      return;
    }

    setAnalyzeLoading(true);

    try {
      const result = await analyzeCv(extractedData);
      setAnalyzerResult(result);
      toast.success("Phân tích CV thành công.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể phân tích CV.",
      );
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-border bg-card/90 shadow-none">
        <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          <div className="rounded-3xl border border-border bg-linear-to-r from-primary/10 via-card to-primary/10 p-4 sm:p-5">
            <div className="mb-4 flex flex-col items-start justify-between gap-4 lg:flex-row">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold tracking-wide text-accent">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> AI CV Analyzer
                </span>
                <h1 className="text-2xl leading-tight font-black text-foreground sm:text-3xl">
                  Tìm công việc phù hợp hơn với{" "}
                  <span className="text-accent">Job Matcher AI</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tải CV PDF lên, hệ thống sẽ trích xuất kỹ năng, phân tích điểm
                  mạnh/yếu và gợi ý các công việc phù hợp nhất với hồ sơ của
                  bạn.
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-dashed border-primary/35 bg-card px-4 py-4 sm:px-5">
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
                className="group flex min-h-37 w-full flex-col items-start justify-between gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-5 transition-all duration-200 hover:border-primary/60 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3 sm:items-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-card shadow-sm transition-transform duration-200 group-hover:scale-[1.02]">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      Kéo thả CV PDF hoặc chọn file
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Chỉ hỗ trợ PDF - tối đa 5MB - phân tích kỹ năng, kinh
                      nghiệm và gợi ý job trong vài bước.
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {file?.name
                        ? `Đã chọn: ${file.name}`
                        : "Bấm vào bất kỳ vị trí nào trong khung để chọn file"}
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
                    className="h-10 w-full rounded-full bg-linear-to-r from-accent to-primary px-6 py-6 text-[16px] font-bold text-primary-foreground disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]  disabled:opacity-70 sm:w-auto sm:px-12"
                  >
                    {uploadLoading || pollLoading ? (
                      <>
                        <CircleDashed className="mr-1.5 h-4 w-4 animate-spin" />
                        {uploadLoading
                          ? "Đang upload..."
                          : "Đang trích xuất..."}
                      </>
                    ) : (
                      "Tải CV lên"
                    )}
                  </Button>
                </div>
              </div>

              {apiLoadingText ? (
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CircleDashed className="h-3.5 w-3.5 animate-spin" />
                  <span>{apiLoadingText}</span>
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step) => {
                const state = getStepState(step.id, {
                  hasCvProcessing,
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
                        ? "border-success/40 bg-success/10"
                        : isActive
                          ? "border-accent/40 bg-accent/10"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-success text-success-foreground"
                            : isActive
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                      </span>
                      <p className="font-bold text-foreground">{step.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {step.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <ResumeProfile
                form={form}
                cvs={uploadedCvs}
                selectedCvId={selectedCvId}
                onSelectCv={(cv) => {
                  setSelectedCvId(cv.id);
                  setForm((prev) => ({
                    ...prev,
                    fileUrl: cv.fileUrl ?? prev.fileUrl,
                  }));
                }}
              />

              <AiResultCard
                form={form}
                hasParsedData={hasParsedData}
                analyzerResult={analyzerResult}
                onAnalyze={handleAnalyze}
                loading={analyzeLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasParsedData && !hasAiAnalysis ? (
        <div ref={formConfirmRef}>
          <FormConfirmCvComponent cvId={cvId} form={form} setForm={setForm} />
        </div>
      ) : null}
    </div>
  );
}

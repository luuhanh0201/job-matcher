"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getMyMatchResults } from "@/services/match-result.service";
import type { MatchResult } from "@/types/match-result";

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "bg-success"
      : score >= 60
        ? "bg-primary"
        : score >= 40
          ? "bg-warning"
          : "bg-destructive";

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold text-foreground">{score}</span>
    </div>
  );
}

function getScoreLabel(score: number) {
  if (score >= 80) return { text: "Rất phù hợp", cls: "bg-success/15 text-success" };
  if (score >= 60) return { text: "Phù hợp", cls: "bg-primary/15 text-primary" };
  if (score >= 40) return { text: "Tương đối", cls: "bg-warning/15 text-warning" };
  return { text: "Ít phù hợp", cls: "bg-destructive/15 text-destructive" };
}

function formatSalary(result: MatchResult["job"]) {
  if (result.salaryType === "NEGOTIABLE") return "Thỏa thuận";
  const fmt = (v: number | null) =>
    v != null ? new Intl.NumberFormat("vi-VN").format(v) : "--";
  if (result.salaryType === "FIXED") return `${fmt(result.salaryMin)} ${result.currency}`;
  return `${fmt(result.salaryMin)} – ${fmt(result.salaryMax)} ${result.currency}`;
}

function MatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false);
  const badge = getScoreLabel(match.overallScore);

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-foreground">{match.job.title}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.cls}`}>
                {badge.text}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {match.job.department} · {match.job.jobType} · {match.job.workMode}
            </p>
            <p className="mt-1 text-sm font-bold text-primary">
              {formatSalary(match.job)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-primary/10 px-6 py-3 text-center">
            <span className="text-3xl font-black text-primary">
              {match.overallScore}
            </span>
            <span className="text-xs font-bold text-primary">/ 100</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <ScoreBar score={match.skillScore} label="Kỹ năng" />
          <ScoreBar score={match.experienceScore} label="Kinh nghiệm" />
          <ScoreBar score={match.educationScore} label="Học vấn" />
          <ScoreBar score={match.titleScore} label="Vị trí" />
        </div>

        {match.explanation && (
          <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm leading-6 text-foreground">
            {match.explanation}
          </p>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Ẩn chi tiết kỹ năng
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Xem chi tiết kỹ năng
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Kỹ năng phù hợp ({match.matchedSkills.length})
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.matchedSkills.length > 0 ? (
                  match.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Không có</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                <XCircle className="h-3.5 w-3.5" />
                Kỹ năng còn thiếu ({match.missingSkills.length})
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {match.missingSkills.length > 0 ? (
                  match.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Không có</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function JobMatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyMatchResults()
      .then((data) => setMatches(data))
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Không thể tải kết quả phù hợp",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Công việc phù hợp</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI phân tích mức độ phù hợp giữa CV của bạn và các tin tuyển dụng đang mở.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-black text-foreground">
              Chưa có kết quả phân tích
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload CV và để AI phân tích để xem công việc phù hợp với bạn.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/profile/me"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Đi đến trang AI-CV
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-warning">
              <AlertCircle className="h-3.5 w-3.5" />
              Kết quả sẽ xuất hiện tự động sau khi CV được phân tích
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            {matches.length} công việc phù hợp, sắp xếp theo điểm giảm dần
          </p>
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

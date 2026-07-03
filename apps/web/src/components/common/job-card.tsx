import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  BadgeDollarSign,
  TrendingUp,
  Clock,
  Bookmark,
} from "lucide-react";
import type { Job, EmploymentType } from "@/services/jobs.service";
import { SENIORITY_LEVEL_LABEL } from "@/types/job";

const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERN: "Thực tập",
  FREELANCE: "Freelance",
};

function formatSalary(min: number, max: number) {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(0)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(0)}K`
        : `${n}`;
  return `$${fmt(min)} – $${fmt(max)}`;
}

function getInitials(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const COMPANY_COLORS = [
  "bg-blue-500/15 text-blue-600",
  "bg-purple-500/15 text-purple-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-orange-500/15 text-orange-600",
  "bg-rose-500/15 text-rose-600",
  "bg-teal-500/15 text-teal-600",
];

function getCompanyColor(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash += company.charCodeAt(i);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

export function JobCard({
  job,
  saved,
  onToggleSave,
}: {
  job: Job;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const color = getCompanyColor(job.company);
  const [hasLogoError, setHasLogoError] = useState(false);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black ${color}`}
        >
          {job.companyLogoUrl && !hasLogoError ? (
            // Logo URLs can come from user uploads/external hosts, so avoid next/image host restrictions here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companyLogoUrl}
              alt={`${job.company} logo`}
              className="h-full w-full object-contain p-1"
              onError={() => setHasLogoError(true)}
            />
          ) : (
            getInitials(job.company)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">{job.company}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {job.status === "OPEN" && (
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                  Đang tuyển
                </span>
              )}
              {onToggleSave && (
                <button
                  type="button"
                  aria-label={saved ? "Bỏ lưu tin" : "Lưu tin"}
                  title={saved ? "Bỏ lưu tin" : "Lưu tin"}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onToggleSave();
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Bookmark
                    className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground sm:gap-x-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <BadgeDollarSign className="h-3.5 w-3.5" />
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {EMPLOYMENT_LABEL[job.employmentType]}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {SENIORITY_LEVEL_LABEL[job.seniorityLevel]}
            </span>
          </div>

          {/* Department badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {job.department}
            </span>
            {job.publishedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(job.publishedAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

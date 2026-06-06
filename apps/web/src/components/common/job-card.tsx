import { useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase, BadgeDollarSign, TrendingUp, Clock } from "lucide-react";
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
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function getCompanyColor(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash += company.charCodeAt(i);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

export function JobCard({ job }: { job: Job }) {
  const color = getCompanyColor(job.company);
  const [hasLogoError, setHasLogoError] = useState(false);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm transition-all hover:border-(--primary-blue)/30 hover:shadow-md sm:p-5"
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
              <h3 className="line-clamp-2 text-base font-bold text-(--gray-900) group-hover:text-(--primary-blue)">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-(--gray-500)">{job.company}</p>
            </div>
            {job.status === "OPEN" && (
              <span className="shrink-0 rounded-full bg-(--accent-green)/10 px-2.5 py-0.5 text-xs font-bold text-(--accent-green)">
                Đang tuyển
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-(--gray-500) sm:gap-x-4">
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
            <span className="rounded-full bg-(--blue-light) px-3 py-1 text-xs font-semibold text-(--primary-blue)">
              {job.department}
            </span>
            {job.publishedAt && (
              <span className="flex items-center gap-1 text-xs text-(--gray-500)">
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

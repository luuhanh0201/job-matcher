"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getJobs, type Job } from "@/services/jobs.service";
import { JobCard } from "@/components/common/job-card";
import { useAuth } from "@/context/auth-context";

// Module-level cache — persists across client-side navigations
let cachedJobs: Job[] | null = null;

const QUICK_ACTIONS = [
  {
    icon: FileText,
    label: "Cập nhật CV",
    desc: "Hồ sơ của bạn",
    href: "/profile",
    color: "bg-(--blue-light) text-(--primary-blue)",
  },
  {
    icon: Sparkles,
    label: "AI CV Analyzer",
    desc: "Phân tích CV với AI",
    href: "/ai-cv",
    color: "bg-(--accent-purple)/10 text-(--accent-purple)",
  },
  {
    icon: Briefcase,
    label: "Tất cả việc làm",
    desc: "Xem tất cả vị trí",
    href: "/jobs",
    color: "bg-(--accent-green)/10 text-(--accent-green)",
  },
  {
    icon: TrendingUp,
    label: "Đầu tư",
    desc: "Khám phá cơ hội",
    href: "/invest",
    color: "bg-(--accent-orange)/10 text-(--accent-orange)",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function HomePage() {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>(cachedJobs ?? []);
  const [loadingJobs, setLoadingJobs] = useState(cachedJobs === null);

  useEffect(() => {
    if (cachedJobs !== null) return;
    getJobs()
      .then((jobs) => {
        cachedJobs = jobs;
        setFeaturedJobs(jobs.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  const firstName = user?.fullName?.split(" ").pop() ?? "";

  return (
    <div className="flex flex-col gap-8">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-(--primary-blue) px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80">{getGreeting()},</p>
          <h1 className="mt-1 text-xl font-black sm:text-2xl">{firstName} 👋</h1>
          <p className="mt-2 max-w-md text-sm opacity-80">
            Hôm nay bạn muốn ứng tuyển vào đâu? Hàng trăm cơ hội việc làm đang chờ bạn.
          </p>
          <Link
            href="/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-(--primary-blue) transition-opacity hover:opacity-90 sm:px-5"
          >
            Khám phá việc làm
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-white/10" />
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-base font-bold text-(--gray-900)">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, href, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-row items-center gap-3 rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm transition-all hover:border-(--primary-blue)/30 hover:shadow-md sm:flex-col sm:items-start"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-(--gray-900) group-hover:text-(--primary-blue)">
                  {label}
                </p>
                <p className="text-xs text-(--gray-500)">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-(--gray-900)">Việc làm nổi bật</h2>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm font-semibold text-(--primary-blue) hover:underline"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingJobs && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-(--gray-200) bg-white"
              />
            ))}
          </div>
        )}

        {!loadingJobs && featuredJobs.length === 0 && (
          <p className="py-8 text-center text-sm text-(--gray-500)">
            Chưa có việc làm nào.
          </p>
        )}

        {!loadingJobs && featuredJobs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredJobs.slice(0, 4).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

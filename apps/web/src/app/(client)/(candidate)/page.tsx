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
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

// Module-level cache — persists across client-side navigations
let cachedJobs: Job[] | null = null;

const QUICK_ACTIONS = [
  {
    icon: FileText,
    label: "Cập nhật CV",
    desc: "Hồ sơ của bạn",
    href: "/profile",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Sparkles,
    label: "AI CV Analyzer",
    desc: "Phân tích CV với AI",
    href: "/ai-cv",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Briefcase,
    label: "Tất cả việc làm",
    desc: "Xem tất cả vị trí",
    href: "/jobs",
    color: "bg-success/10 text-success",
  },
  {
    icon: TrendingUp,
    label: "Đầu tư",
    desc: "Khám phá cơ hội",
    href: "/invest",
    color: "bg-warning/10 text-warning",
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
    getJobs({ limit: 4 })
      .then(({ items }) => {
        cachedJobs = items;
        setFeaturedJobs(items);
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  const firstName = user?.fullName?.split(" ").pop() ?? "";

  return (
    <div className="flex flex-col gap-8">
      {/* Hero greeting */}
      <FadeIn className="relative overflow-hidden rounded-2xl bg-primary px-5 py-6 text-primary-foreground sm:px-8 sm:py-8">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80">{getGreeting()},</p>
          <h1 className="mt-1 text-xl font-black sm:text-2xl">{firstName} 👋</h1>
          <p className="mt-2 max-w-md text-sm opacity-80">
            Hôm nay bạn muốn ứng tuyển vào đâu? Hàng trăm cơ hội việc làm đang chờ bạn.
          </p>
          <Link
            href="/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-bold text-primary transition-opacity hover:opacity-90 sm:px-5"
          >
            Khám phá việc làm
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-white/10" />
      </FadeIn>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-base font-bold text-foreground">Thao tác nhanh</h2>
        <StaggerList className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, href, color }) => (
            <StaggerItem key={href}>
              <Link
                href={href}
                className="group flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:flex-col sm:items-start"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      {/* Featured jobs */}
      <section>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">Việc làm nổi bật</h2>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
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
                className="h-36 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        )}

        {!loadingJobs && featuredJobs.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có việc làm nào.
          </p>
        )}

        {!loadingJobs && featuredJobs.length > 0 && (
          <StaggerList className="grid gap-4 sm:grid-cols-2">
            {featuredJobs.slice(0, 4).map((job) => (
              <StaggerItem key={job.id}>
                <JobCard job={job} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </section>
    </div>
  );
}

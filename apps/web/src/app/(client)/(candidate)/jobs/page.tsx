"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SearchX } from "lucide-react";
import { getJobs, type Job } from "@/services/jobs.service";
import { JobCard } from "@/components/common/job-card";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch all jobs once
  useEffect(() => {
    getJobs()
      .then((data) => setAllJobs(data))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Không thể tải danh sách việc làm"),
      )
      .finally(() => setLoading(false));
  }, []);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (loading || visibleCount >= allJobs.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allJobs.length));
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, visibleCount, allJobs.length]);

  const visibleJobs = allJobs.slice(0, visibleCount);
  const hasMore = visibleCount < allJobs.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-(--gray-900)">Danh sách việc làm</h1>
        <p className="mt-1 text-sm text-(--gray-500)">
          {loading ? "Đang tải..." : `${allJobs.length} vị trí đang tuyển dụng`}
        </p>
      </div>

      {/* Initial loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-(--gray-200) bg-white"
            />
          ))}
        </div>
      )}

      {/* Job list */}
      {!loading && visibleJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-(--gray-500)">
          <SearchX className="h-10 w-10 opacity-40" />
          <p className="font-medium">Chưa có việc làm nào</p>
        </div>
      )}

      {!loading && visibleJobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Sentinel + loading indicator */}
      {!loading && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {hasMore && <Loader2 className="h-5 w-5 animate-spin text-(--gray-500)" />}
        </div>
      )}
    </div>
  );
}


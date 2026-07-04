"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkX, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/common/job-card";
import { getMySavedJobs, unsaveJob } from "@/services/saved-job.service";
import type { Job } from "@/services/jobs.service";
import type { JobPostProfile } from "@/types/job";

const PAGE_SIZE = 12;

function toJobCardModel(jobPost: JobPostProfile): Job {
  const location = [
    jobPost.location?.address,
    jobPost.location?.wardName,
    jobPost.location?.provinceName,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: jobPost.id,
    title: jobPost.title,
    department: jobPost.department,
    employmentType: jobPost.jobType,
    seniorityLevel: jobPost.seniorityLevel,
    company: jobPost.company?.name || "Chưa cập nhật công ty",
    companyLogoUrl: jobPost.company?.logoUrl,
    location: location || "Chưa cập nhật địa điểm",
    salaryMin: jobPost.salaryMin ?? 0,
    salaryMax: jobPost.salaryMax ?? 0,
    description: jobPost.description,
    requirements: jobPost.requirements,
    status: jobPost.status,
    publishedAt: jobPost.publishedAt || "",
    expiredAt: jobPost.expiredAt || "",
    createdAt: jobPost.createdAt,
    updatedAt: jobPost.updatedAt,
  };
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSavedJobs = useCallback(
    (pageNumber: number) => {
      setLoading(true);
      getMySavedJobs({
        keyword: keyword || undefined,
        page: pageNumber,
        limit: PAGE_SIZE,
      })
        .then((result) => {
          setJobs(result.items.map(toJobCardModel));
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        })
        .catch((error: unknown) =>
          toast.error(
            error instanceof Error ? error.message : "Không thể tải danh sách việc đã lưu",
          ),
        )
        .finally(() => setLoading(false));
    },
    [keyword],
  );

  useEffect(() => {
    fetchSavedJobs(1);
  }, [fetchSavedJobs]);

  const handleUnsave = async (job: Job) => {
    const previousJobs = jobs;
    setJobs((prev) => prev.filter((item) => item.id !== job.id));
    try {
      await unsaveJob(job.id);
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success("Đã bỏ lưu tin tuyển dụng");
    } catch (error: unknown) {
      setJobs(previousJobs);
      toast.error(
        error instanceof Error ? error.message : "Không thể bỏ lưu tin tuyển dụng",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Việc đã lưu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `${total} tin tuyển dụng đã lưu`}
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Tìm trong việc đã lưu theo vị trí, công ty..."
          className="h-11 rounded-xl border-border bg-muted/50 pl-10"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <BookmarkX className="h-10 w-10 opacity-40" />
          <p className="font-medium">
            {keyword
              ? "Không tìm thấy tin đã lưu phù hợp"
              : "Bạn chưa lưu tin tuyển dụng nào"}
          </p>
          {!keyword && (
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs">Khám phá việc làm</Link>
            </Button>
          )}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved
              onToggleSave={() => handleUnsave(job)}
            />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchSavedJobs(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchSavedJobs(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

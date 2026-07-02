"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/common/job-card";
import { getJobs, type Job } from "@/services/jobs.service";

const PAGE_SIZE = 8;

type JobCategory = "all" | "it" | "sales" | "hospitality" | "education" | "general";

const CATEGORY_CONFIG: Record<
  JobCategory,
  { title: string; description: string; keywords: string[] }
> = {
  all: {
    title: "Danh sách việc làm",
    description: "Tìm kiếm các vị trí đang tuyển dụng phù hợp với bạn.",
    keywords: [],
  },
  it: {
    title: "Việc làm IT - Phần mềm",
    description: "Các vị trí phát triển phần mềm, dữ liệu, QA và công nghệ.",
    keywords: [
      "it",
      "software",
      "developer",
      "frontend",
      "backend",
      "fullstack",
      "engineer",
      "qa",
      "tester",
      "devops",
      "data",
      "react",
      "next",
      "typescript",
      "java",
      "python",
      "php",
      "công nghệ",
      "phần mềm",
      "lập trình",
    ],
  },
  sales: {
    title: "Việc làm Kinh doanh - Bán hàng",
    description: "Các vị trí sales, account, phát triển thị trường và chăm sóc khách hàng.",
    keywords: [
      "sales",
      "sale",
      "business",
      "account",
      "kinh doanh",
      "bán hàng",
      "tư vấn",
      "chăm sóc khách hàng",
      "phát triển thị trường",
    ],
  },
  hospitality: {
    title: "Việc làm Nhà hàng - Khách sạn",
    description: "Các vị trí dịch vụ, vận hành nhà hàng, khách sạn và du lịch.",
    keywords: [
      "hotel",
      "restaurant",
      "hospitality",
      "tourism",
      "nhà hàng",
      "khách sạn",
      "du lịch",
      "lễ tân",
      "dịch vụ",
    ],
  },
  education: {
    title: "Việc làm Giáo dục - Đào tạo",
    description: "Các vị trí giáo viên, đào tạo, học vụ và phát triển chương trình.",
    keywords: [
      "education",
      "teacher",
      "trainer",
      "academic",
      "giáo dục",
      "đào tạo",
      "giáo viên",
      "giảng viên",
      "học vụ",
    ],
  },
  general: {
    title: "Việc làm phổ thông",
    description: "Các vị trí vận hành, kho, giao nhận và lao động phổ thông.",
    keywords: [
      "general",
      "operator",
      "warehouse",
      "driver",
      "shipper",
      "phổ thông",
      "lao động",
      "vận hành",
      "kho",
      "giao hàng",
      "sản xuất",
    ],
  },
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchText(job: Job) {
  return normalize(
    [
      job.title,
      job.company,
      job.department,
      job.location,
      job.description,
      job.requirements,
      job.employmentType,
      job.seniorityLevel,
    ].join(" "),
  );
}

function matchesCategory(job: Job, category: JobCategory) {
  const keywords = CATEGORY_CONFIG[category].keywords;
  if (keywords.length === 0) return true;

  const searchText = getSearchText(job);
  return keywords.some((keyword) => searchText.includes(normalize(keyword)));
}

export function CandidateJobList({ category = "all" }: { category?: JobCategory }) {
  const config = CATEGORY_CONFIG[category];
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getJobs()
      .then((data) => setAllJobs(data))
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Không thể tải danh sách việc làm",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = normalize(searchTerm.trim());

    return allJobs.filter((job) => {
      const categoryMatched = matchesCategory(job, category);
      if (!categoryMatched) return false;
      if (!normalizedSearch) return true;
      return getSearchText(job).includes(normalizedSearch);
    });
  }, [allJobs, category, searchTerm]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, searchTerm]);

  useEffect(() => {
    if (loading || visibleCount >= filteredJobs.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredJobs.length));
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, visibleCount, filteredJobs.length]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `${filteredJobs.length} vị trí phù hợp`}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo vị trí, công ty, địa điểm, kỹ năng..."
            className="h-11 rounded-xl border-border bg-muted/50 pl-10"
          />
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {config.description}
        </p>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      )}

      {!loading && visibleJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <SearchX className="h-10 w-10 opacity-40" />
          <p className="font-medium">Không tìm thấy việc làm phù hợp</p>
        </div>
      )}

      {!loading && visibleJobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {!loading && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {hasMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}

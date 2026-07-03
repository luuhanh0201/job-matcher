"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterX, Loader2, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "@/components/common/job-card";
import { useAuth } from "@/context/auth-context";
import {
  getJobs,
  type EmploymentType,
  type Job,
  type JobSortOption,
  type JobsQuery,
  type SeniorityLevel,
} from "@/services/jobs.service";
import {
  getMySavedJobIds,
  saveJob,
  unsaveJob,
} from "@/services/saved-job.service";
import { getProvinces } from "@/services/location.service";
import type { Province } from "@/types/location";
import { SENIORITY_LEVEL_LABEL } from "@/types/job";

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

const JOB_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERN: "Thực tập",
  FREELANCE: "Freelance",
};

const SALARY_OPTIONS = [
  { value: "5000000", label: "Từ 5 triệu" },
  { value: "10000000", label: "Từ 10 triệu" },
  { value: "15000000", label: "Từ 15 triệu" },
  { value: "20000000", label: "Từ 20 triệu" },
  { value: "30000000", label: "Từ 30 triệu" },
  { value: "50000000", label: "Từ 50 triệu" },
];

// Radix Select không cho phép item có value rỗng — dùng sentinel "all"
const ALL = "all";

type Filters = {
  keyword: string;
  provinceCode: string;
  jobType: string;
  seniorityLevel: string;
  salaryMin: string;
  sort: string;
};

const FILTER_PARAM_KEYS: Record<keyof Filters, string> = {
  keyword: "q",
  provinceCode: "province",
  jobType: "jobType",
  seniorityLevel: "level",
  salaryMin: "salaryMin",
  sort: "sort",
};

function CandidateJobListInner({ category = "all" }: { category?: JobCategory }) {
  const config = CATEGORY_CONFIG[category];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isCandidate = user?.role === "CANDIDATE";

  const filters = useMemo<Filters>(
    () => ({
      keyword: searchParams.get("q") ?? "",
      provinceCode: searchParams.get("province") ?? "",
      jobType: searchParams.get("jobType") ?? "",
      seniorityLevel: searchParams.get("level") ?? "",
      salaryMin: searchParams.get("salaryMin") ?? "",
      sort: searchParams.get("sort") ?? "newest",
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (patch: Partial<Filters>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        const paramKey = FILTER_PARAM_KEYS[key as keyof Filters];
        if (value && value !== ALL && !(key === "sort" && value === "newest")) {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, router, pathname],
  );

  // Ô tìm kiếm gõ tự do, debounce 400ms rồi mới đồng bộ lên URL
  const [searchTerm, setSearchTerm] = useState(filters.keyword);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== filters.keyword) {
        updateFilters({ keyword: searchTerm.trim() });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.keyword, updateFilters]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => {});
  }, []);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestIdRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildQuery = useCallback(
    (pageNumber: number): JobsQuery => ({
      keyword: filters.keyword || undefined,
      keywords: config.keywords.length ? config.keywords : undefined,
      provinceCode: filters.provinceCode || undefined,
      jobType: (filters.jobType || undefined) as EmploymentType | undefined,
      seniorityLevel: (filters.seniorityLevel || undefined) as
        | SeniorityLevel
        | undefined,
      salaryMin: filters.salaryMin ? Number(filters.salaryMin) : undefined,
      sort: filters.sort as JobSortOption,
      page: pageNumber,
      limit: PAGE_SIZE,
    }),
    [filters, config.keywords],
  );

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    getJobs(buildQuery(1))
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setJobs(result.items);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
      })
      .catch((error: unknown) => {
        if (requestId !== requestIdRef.current) return;
        toast.error(
          error instanceof Error ? error.message : "Không thể tải danh sách việc làm",
        );
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setLoading(false);
      });
  }, [buildQuery]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    getJobs(buildQuery(page + 1))
      .then((result) => {
        if (requestId !== requestIdRef.current) return;
        setJobs((prev) => [...prev, ...result.items]);
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Không thể tải thêm việc làm",
        ),
      )
      .finally(() => setLoadingMore(false));
  }, [loading, loadingMore, hasMore, page, buildQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Danh sách tin đã lưu để hiển thị trạng thái bookmark
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isCandidate) return;
    getMySavedJobIds()
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => {});
  }, [isCandidate]);

  const toggleSave = useCallback(
    async (job: Job) => {
      const wasSaved = savedIds.has(job.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(job.id);
        else next.add(job.id);
        return next;
      });
      try {
        if (wasSaved) {
          await unsaveJob(job.id);
        } else {
          await saveJob(job.id);
          toast.success("Đã lưu tin tuyển dụng");
        }
      } catch (error: unknown) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(job.id);
          else next.delete(job.id);
          return next;
        });
        toast.error(
          error instanceof Error ? error.message : "Không thể cập nhật tin đã lưu",
        );
      }
    },
    [savedIds],
  );

  const hasActiveFilters =
    Boolean(
      filters.keyword ||
        filters.provinceCode ||
        filters.jobType ||
        filters.seniorityLevel ||
        filters.salaryMin,
    ) || filters.sort !== "newest";

  const clearFilters = () => {
    setSearchTerm("");
    updateFilters({
      keyword: "",
      provinceCode: "",
      jobType: "",
      seniorityLevel: "",
      salaryMin: "",
      sort: "newest",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `${total} vị trí phù hợp`}
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select
            value={filters.provinceCode || ALL}
            onValueChange={(value) => updateFilters({ provinceCode: value })}
          >
            <SelectTrigger className="h-9 w-auto min-w-36 rounded-xl text-xs">
              <SelectValue placeholder="Tỉnh/Thành phố" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả địa điểm</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province.province_code} value={province.province_code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.jobType || ALL}
            onValueChange={(value) => updateFilters({ jobType: value })}
          >
            <SelectTrigger className="h-9 w-auto min-w-36 rounded-xl text-xs">
              <SelectValue placeholder="Loại công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi loại công việc</SelectItem>
              {Object.entries(JOB_TYPE_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.seniorityLevel || ALL}
            onValueChange={(value) => updateFilters({ seniorityLevel: value })}
          >
            <SelectTrigger className="h-9 w-auto min-w-32 rounded-xl text-xs">
              <SelectValue placeholder="Kinh nghiệm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi cấp độ</SelectItem>
              {Object.entries(SENIORITY_LEVEL_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.salaryMin || ALL}
            onValueChange={(value) => updateFilters({ salaryMin: value })}
          >
            <SelectTrigger className="h-9 w-auto min-w-32 rounded-xl text-xs">
              <SelectValue placeholder="Mức lương" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi mức lương</SelectItem>
              {SALARY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sort}
            onValueChange={(value) => updateFilters({ sort: value })}
          >
            <SelectTrigger className="h-9 w-auto min-w-32 rounded-xl text-xs">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="salary_desc">Lương cao nhất</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 rounded-xl text-xs text-muted-foreground"
            >
              <FilterX className="mr-1 h-3.5 w-3.5" />
              Xóa lọc
            </Button>
          )}
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

      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <SearchX className="h-10 w-10 opacity-40" />
          <p className="font-medium">Không tìm thấy việc làm phù hợp</p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Xóa bộ lọc
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
              saved={isCandidate ? savedIds.has(job.id) : undefined}
              onToggleSave={isCandidate ? () => toggleSave(job) : undefined}
            />
          ))}
        </div>
      )}

      {!loading && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {(hasMore || loadingMore) && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}

export function CandidateJobList(props: { category?: JobCategory }) {
  // useSearchParams yêu cầu Suspense boundary khi prerender
  return (
    <Suspense fallback={null}>
      <CandidateJobListInner {...props} />
    </Suspense>
  );
}

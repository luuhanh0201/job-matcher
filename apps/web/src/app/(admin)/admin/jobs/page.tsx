"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleCheck, Loader2, Search, ShieldBan, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminJobs,
  updateAdminJobStatus,
  type Paginated,
} from "@/services/admin.service";
import type { JobPostProfile, JobPostStatus } from "@/types/job";

const PAGE_SIZE = 20;
const ALL = "all";

const STATUS_LABEL: Record<JobPostStatus, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
  BLOCKED: "Bị khóa",
};

function getStatusClass(status: JobPostStatus) {
  if (status === "OPEN") return "bg-success/15 text-success";
  if (status === "BLOCKED") return "bg-destructive/15 text-destructive";
  if (status === "CLOSED") return "bg-muted text-muted-foreground";
  return "bg-warning/15 text-warning";
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPostProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchJobs = useCallback(
    (pageNumber: number) => {
      setLoading(true);
      getAdminJobs({
        keyword: keyword || undefined,
        status: (statusFilter || undefined) as JobPostStatus | undefined,
        page: pageNumber,
        limit: PAGE_SIZE,
      })
        .then((result: Paginated<JobPostProfile>) => {
          setJobs(result.items);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        })
        .catch((error: unknown) =>
          toast.error(
            error instanceof Error ? error.message : "Không thể tải danh sách tin tuyển dụng",
          ),
        )
        .finally(() => setLoading(false));
    },
    [keyword, statusFilter],
  );

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleUpdateStatus = async (
    job: JobPostProfile,
    status: "OPEN" | "CLOSED" | "BLOCKED",
  ) => {
    setUpdatingId(job.id);
    try {
      const updated = await updateAdminJobStatus(job.id, status);
      setJobs((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        status === "BLOCKED"
          ? `Đã khóa tin "${updated.title}"`
          : status === "OPEN"
            ? `Đã mở lại tin "${updated.title}"`
            : `Đã đóng tin "${updated.title}"`,
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái tin",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Quản lý tin tuyển dụng</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `${total} tin tuyển dụng`}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tiêu đề hoặc công ty..."
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Select
          value={statusFilter || ALL}
          onValueChange={(value) => setStatusFilter(value === ALL ? "" : value)}
        >
          <SelectTrigger className="h-9 w-full rounded-lg text-sm sm:w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Tiêu đề</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Công ty</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Người đăng</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Ngày tạo</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!loading && jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Không tìm thấy tin tuyển dụng nào
                  </td>
                </tr>
              )}
              {!loading &&
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border transition-colors hover:bg-muted"
                  >
                    <td className="max-w-64 truncate px-4 py-3 font-medium text-foreground">
                      {job.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.createdBy?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(job.status)}`}
                      >
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {job.status === "BLOCKED" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Mở lại tin"
                            disabled={updatingId === job.id}
                            onClick={() => handleUpdateStatus(job, "OPEN")}
                            className="h-7 w-7 text-success hover:bg-success/10"
                          >
                            <CircleCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <>
                            {job.status === "OPEN" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Đóng tin"
                                disabled={updatingId === job.id}
                                onClick={() => handleUpdateStatus(job, "CLOSED")}
                                className="h-7 w-7 text-warning hover:bg-warning/10"
                              >
                                <ShieldX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Khóa tin vi phạm"
                              disabled={updatingId === job.id}
                              onClick={() => handleUpdateStatus(job, "BLOCKED")}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            >
                              <ShieldBan className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

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
              onClick={() => fetchJobs(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchJobs(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CircleCheck,
  CircleX,
  Eye,
  Loader2,
  Search,
  ShieldX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminCompanies,
  getAdminCompanyDetail,
  updateAdminCompanyStatus,
  type AdminCompanyDetail,
  type Paginated,
} from "@/services/admin.service";
import type { CompanyProfile, CompanyStatus } from "@/types/company";

const PAGE_SIZE = 20;
const ALL = "all";

const STATUS_LABEL: Record<CompanyStatus, string> = {
  PENDING_APPROVAL: "Chờ duyệt",
  ACTIVE: "Đã duyệt",
  INACTIVE: "Ngừng hoạt động",
  REJECTED: "Bị từ chối",
};

function getStatusClass(status: CompanyStatus) {
  if (status === "ACTIVE") return "bg-success/15 text-success";
  if (status === "REJECTED") return "bg-destructive/15 text-destructive";
  if (status === "INACTIVE") return "bg-muted text-muted-foreground";
  return "bg-warning/15 text-warning";
}

const USER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Bị khóa",
  BANNED: "Bị cấm",
};

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="truncate text-sm text-foreground" title={value ?? undefined}>
        {value || "—"}
      </p>
    </div>
  );
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [rejectingCompany, setRejectingCompany] =
    useState<CompanyProfile | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [detail, setDetail] = useState<AdminCompanyDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCompanies = useCallback(
    (pageNumber: number) => {
      setLoading(true);
      getAdminCompanies({
        keyword: keyword || undefined,
        status: (statusFilter || undefined) as CompanyStatus | undefined,
        page: pageNumber,
        limit: PAGE_SIZE,
      })
        .then((result: Paginated<CompanyProfile>) => {
          setCompanies(result.items);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        })
        .catch((error: unknown) =>
          toast.error(
            error instanceof Error ? error.message : "Không thể tải danh sách công ty",
          ),
        )
        .finally(() => setLoading(false));
    },
    [keyword, statusFilter],
  );

  useEffect(() => {
    fetchCompanies(1);
  }, [fetchCompanies]);

  const handleUpdateStatus = async (
    company: CompanyProfile,
    status: "ACTIVE" | "INACTIVE" | "REJECTED",
    reason?: string,
  ) => {
    setUpdatingId(company.id);
    try {
      const updated = await updateAdminCompanyStatus(company.id, status, reason);
      setCompanies((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDetail((prev) =>
        prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
      );
      toast.success(
        status === "ACTIVE"
          ? `Đã duyệt công ty "${updated.name}"`
          : status === "REJECTED"
            ? `Đã từ chối công ty "${updated.name}"`
            : `Đã ngừng hoạt động công ty "${updated.name}"`,
      );
      return true;
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái công ty",
      );
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetail = async (company: CompanyProfile) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await getAdminCompanyDetail(company.id));
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tải chi tiết công ty",
      );
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingCompany) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    const ok = await handleUpdateStatus(
      rejectingCompany,
      "REJECTED",
      rejectReason.trim(),
    );
    if (ok) {
      setRejectingCompany(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Quản lý công ty</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `${total} công ty`}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tên công ty, mã số thuế hoặc email người tạo..."
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
                <th className="px-4 py-3 text-left font-semibold text-foreground">Công ty</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Người tạo</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Mã số thuế</th>
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
              {!loading && companies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Không tìm thấy công ty nào
                  </td>
                </tr>
              )}
              {!loading &&
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-border transition-colors hover:bg-muted"
                  >
                    <td className="max-w-64 truncate px-4 py-3 font-medium text-foreground">
                      {company.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {company.createdBy?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {company.taxCode || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        title={
                          company.status === "REJECTED"
                            ? company.rejectionReason ?? undefined
                            : undefined
                        }
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(company.status)}`}
                      >
                        {STATUS_LABEL[company.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem chi tiết công ty và nhà tuyển dụng"
                          onClick={() => handleOpenDetail(company)}
                          className="h-7 w-7 text-muted-foreground hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {company.status !== "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Phê duyệt công ty"
                            disabled={updatingId === company.id}
                            onClick={() => handleUpdateStatus(company, "ACTIVE")}
                            className="h-7 w-7 text-success hover:bg-success/10"
                          >
                            <CircleCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {company.status !== "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Từ chối công ty"
                            disabled={updatingId === company.id}
                            onClick={() => {
                              setRejectReason("");
                              setRejectingCompany(company);
                            }}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          >
                            <CircleX className="h-4 w-4" />
                          </Button>
                        )}
                        {company.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ngừng hoạt động"
                            disabled={updatingId === company.id}
                            onClick={() => handleUpdateStatus(company, "INACTIVE")}
                            className="h-7 w-7 text-warning hover:bg-warning/10"
                          >
                            <ShieldX className="h-4 w-4" />
                          </Button>
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
              onClick={() => fetchCompanies(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchCompanies(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết công ty</DialogTitle>
            <DialogDescription>
              Thông tin hồ sơ công ty và nhà tuyển dụng đã đăng ký.
            </DialogDescription>
          </DialogHeader>

          {detailLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!detailLoading && detail && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {detail.logoUrl ? (
                    // Logo do người dùng upload từ host ngoài, tránh ràng buộc host của next/image
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.logoUrl}
                      alt={`${detail.name} logo`}
                      className="h-14 w-14 rounded-xl object-contain p-1"
                    />
                  ) : (
                    <Building2 className="h-7 w-7" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{detail.name}</h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClass(detail.status)}`}
                    >
                      {STATUS_LABEL[detail.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {detail.companyType || "Chưa cập nhật lĩnh vực"} · Quy mô{" "}
                    {detail.companySize} nhân sự
                  </p>
                </div>
              </div>

              {detail.status === "REJECTED" && detail.rejectionReason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-xs font-semibold text-destructive">Lý do từ chối</p>
                  <p className="mt-1 text-sm text-foreground">{detail.rejectionReason}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
                <DetailField label="Tên viết tắt" value={detail.shortName} />
                <DetailField label="Mã số thuế" value={detail.taxCode} />
                <DetailField label="Email công ty" value={detail.email} />
                <DetailField label="Điện thoại công ty" value={detail.phone} />
                <DetailField label="Website" value={detail.website} />
                <DetailField label="LinkedIn" value={detail.linkedinUrl} />
                <DetailField label="Facebook" value={detail.facebookUrl} />
                <DetailField
                  label="Ngày đăng ký"
                  value={new Date(detail.createdAt).toLocaleDateString("vi-VN")}
                />
                <div className="sm:col-span-2">
                  <DetailField
                    label="Địa chỉ"
                    value={[
                      detail.location?.address,
                      detail.location?.wardName,
                      detail.location?.provinceName,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </div>
                {detail.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Giới thiệu</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                      {detail.description}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">
                  Nhà tuyển dụng đăng ký
                </h4>
                {detail.recruiter ? (
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
                    <DetailField label="Họ tên" value={detail.recruiter.fullName} />
                    <DetailField label="Email tài khoản" value={detail.recruiter.email} />
                    <DetailField label="Điện thoại" value={detail.recruiter.phone} />
                    <DetailField
                      label="Trạng thái tài khoản"
                      value={`${USER_STATUS_LABEL[detail.recruiter.status] ?? detail.recruiter.status}${detail.recruiter.isVerify ? " · Đã xác minh email" : " · Chưa xác minh email"}`}
                    />
                    <DetailField
                      label="Email liên hệ tuyển dụng"
                      value={detail.recruiter.contactEmail}
                    />
                    <DetailField
                      label="SĐT liên hệ tuyển dụng"
                      value={detail.recruiter.contactPhone}
                    />
                    <DetailField
                      label="Tham gia"
                      value={new Date(detail.recruiter.createdAt).toLocaleDateString("vi-VN")}
                    />
                    <DetailField
                      label="Đăng nhập gần nhất"
                      value={
                        detail.recruiter.lastLoginAt
                          ? new Date(detail.recruiter.lastLoginAt).toLocaleString("vi-VN")
                          : null
                      }
                    />
                  </div>
                ) : (
                  <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                    Không tìm thấy thông tin nhà tuyển dụng của công ty này.
                  </p>
                )}
              </div>
            </div>
          )}

          {!detailLoading && detail && (
            <DialogFooter>
              {detail.status !== "REJECTED" && (
                <Button
                  variant="outline"
                  disabled={updatingId === detail.id}
                  onClick={() => {
                    setRejectReason("");
                    setRejectingCompany(detail);
                  }}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <CircleX className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
              )}
              {detail.status !== "ACTIVE" && (
                <Button
                  disabled={updatingId === detail.id}
                  onClick={() => handleUpdateStatus(detail, "ACTIVE")}
                >
                  {updatingId === detail.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CircleCheck className="mr-2 h-4 w-4" />
                  )}
                  Phê duyệt
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectingCompany !== null}
        onOpenChange={(open) => {
          if (!open) setRejectingCompany(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối công ty</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối hồ sơ công ty{" "}
              <span className="font-semibold text-foreground">
                {rejectingCompany?.name}
              </span>
              . Lý do sẽ được gửi qua email cho nhà tuyển dụng.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Ví dụ: Thông tin mã số thuế không hợp lệ..."
            className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectingCompany(null)}
              disabled={updatingId === rejectingCompany?.id}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={updatingId === rejectingCompany?.id}
            >
              {updatingId === rejectingCompany?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

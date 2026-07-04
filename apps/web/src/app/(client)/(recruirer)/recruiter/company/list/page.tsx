"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  CircleDashed,
  CircleSlash,
  CircleX,
  Eye,
  Globe,
  MapPin,
  Pen,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { getMyCompany } from "@/services/company.service";
import type { CompanyProfile } from "@/types/company";
import { toast } from "sonner";

export default function RecruiterCompanyListPage() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Recruiter thường chỉ có vài công ty nên lọc client-side là đủ
  const filteredCompanies = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return companies;
    return companies.filter((company) =>
      [
        company.name,
        company.companyType,
        company.location?.address,
        company.location?.wardName,
        company.location?.provinceName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [companies, searchTerm]);

  useEffect(() => {
    getMyCompany()
      .then((data) => setCompanies(data || []))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Không thể tải danh sách công ty"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Danh sách công ty
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các công ty bạn đã đăng ký để sử dụng trong tin tuyển dụng.
          </p>
        </div>
        <Link href="/recruiter/company/profile">
          <Button className="h-10 gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Tạo công ty
          </Button>
        </Link>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên công ty, lĩnh vực, địa chỉ..."
              className="h-11 rounded-xl border-border bg-muted/60 pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:items-center">
            <SummaryPill label="Tổng công ty" value={companies.length} />
            <SummaryPill
              label="Đã duyệt"
              value={
                companies.filter((company) => company.status === "ACTIVE")
                  .length
              }
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {loading ? (
            <div className="rounded-2xl border border-border bg-muted/50 p-5 text-sm font-medium text-muted-foreground">
              Đang tải danh sách công ty...
            </div>
          ) : null}

          {!loading && filteredCompanies.length === 0 ? (
            searchTerm.trim() ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-sm font-bold text-foreground">
                  Không tìm thấy công ty phù hợp
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thử đổi từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              <Link href="/recruiter/company/profile" className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-sm font-bold text-foreground">
                  Chưa có công ty nào
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tạo hồ sơ công ty đầu tiên để bắt đầu đăng tuyển.
                </p>
              </Link>
            )
          ) : null}

          {filteredCompanies.map((company) => (
            <article
              key={company.id}
              className="rounded-2xl border border-border p-4 transition-colors hover:border-primary/35 hover:bg-primary/10"
            >
              <div className="grid gap-4 lg:grid-cols-[3.5rem_minmax(0,1fr)_8.5rem] lg:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {company.logoUrl ? (
                    // Logo URLs can come from user uploads/external hosts, so avoid next/image host restrictions here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="h-14 w-14 rounded-2xl object-contain p-1"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="h-7 w-7" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="grid min-h-12 gap-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-start">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-foreground">
                        {company.name}
                      </h2>
                      <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
                        {company.companyType || "Chưa cập nhật lĩnh vực"}
                      </p>
                    </div>
                    
                    <CompanyStatusBadge company={company} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <InlineInfo
                      icon={MapPin}
                      value={[
                        company.location?.address,
                        company.location?.wardName,
                        company.location?.provinceName,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <InlineInfo icon={Phone} value={company.phone} />
                    <InlineInfo icon={Globe} value={company.website} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:justify-self-end">
                  <Link href={`/recruiter/company/${company.id}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full gap-2 rounded-xl font-bold lg:w-34"
                    >
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </Link>

                  <Link href={`/recruiter/company/${company.id}/edit`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full gap-2 rounded-xl font-bold lg:w-34"
                    >
                      <Pen className="h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CompanyStatusBadge({ company }: { company: CompanyProfile }) {
  if (company.status === "ACTIVE") {
    return (
      <span className="inline-flex h-7 w-28 items-center justify-center gap-1 rounded-full bg-success/10 px-2 text-xs font-bold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã duyệt
      </span>
    );
  }
  if (company.status === "REJECTED") {
    return (
      <span
        title={
          company.rejectionReason
            ? `Lý do: ${company.rejectionReason}. Cập nhật hồ sơ để gửi duyệt lại.`
            : "Cập nhật hồ sơ để gửi duyệt lại."
        }
        className="inline-flex h-7 w-28 items-center justify-center gap-1 rounded-full bg-destructive/10 px-2 text-xs font-bold text-destructive"
      >
        <CircleX className="h-3.5 w-3.5" />
        Bị từ chối
      </span>
    );
  }
  if (company.status === "INACTIVE") {
    return (
      <span className="inline-flex h-7 w-28 items-center justify-center gap-1 rounded-full bg-muted px-2 text-xs font-bold text-muted-foreground">
        <CircleSlash className="h-3.5 w-3.5" />
        Ngừng hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-28 items-center justify-center gap-1 rounded-full bg-warning/10 px-2 text-xs font-bold text-warning">
      <CircleDashed className="h-3.5 w-3.5" />
      Chờ duyệt
    </span>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-muted/60 px-3 py-2">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-base font-black text-foreground">{value}</p>
    </div>
  );
}

function InlineInfo({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value?: string | null;
}) {
  return (
    <span className="grid min-h-11 min-w-0 grid-cols-[2rem_1fr] items-center rounded-xl border border-border bg-muted/45 px-2 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate pl-2 text-sm font-medium text-foreground">
        {value || "Chưa cập nhật"}
      </span>
    </span>
  );
}

"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  CircleDashed,
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
import { useEffect, useState } from "react";
import { getMyCompany } from "@/services/company.service";
import type { CompanyProfile } from "@/types/company";
import { toast } from "sonner";

export default function RecruiterCompanyListPage() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
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
          <h1 className="text-2xl font-black text-(--gray-900)">
            Danh sách công ty
          </h1>
          <p className="mt-1 text-sm text-(--gray-500)">
            Quản lý các công ty bạn đã đăng ký để sử dụng trong tin tuyển dụng.
          </p>
        </div>
        <Link href="/recruiter/company/profile">
          <Button className="h-10 gap-2 rounded-xl bg-(--primary-blue) px-4 font-bold text-white hover:bg-(--blue-dark)">
            <Plus className="h-4 w-4" />
            Tạo công ty
          </Button>
        </Link>
      </header>

      <section className="rounded-2xl border border-(--gray-200) bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
            <Input
              placeholder="Tìm theo tên công ty, lĩnh vực, địa chỉ..."
              className="h-11 rounded-xl border-(--gray-200) bg-(--gray-100)/60 pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:items-center">
            <SummaryPill label="Tổng công ty" value={companies.length} />
            <SummaryPill
              label="Đã xác minh"
              value={companies.filter((company) => company.isVerified).length}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {loading ? (
            <div className="rounded-2xl border border-(--gray-200) bg-(--gray-100)/50 p-5 text-sm font-medium text-(--gray-500)">
              Đang tải danh sách công ty...
            </div>
          ) : null}

          {!loading && companies.length === 0 ? (
            <Link href="/recruiter/company/profile" className="rounded-2xl border border-dashed border-(--gray-300) p-6 text-center">
              <p className="text-sm font-bold text-(--gray-900)">
                Chưa có công ty nào
              </p>
              <p className="mt-1 text-sm text-(--gray-500)">
                Tạo hồ sơ công ty đầu tiên để bắt đầu đăng tuyển.
              </p>
            </Link>
          ) : null}

          {companies.map((company) => (
            <article
              key={company.id}
              className="rounded-2xl border border-(--gray-200) p-4 transition-colors hover:border-(--primary-blue)/35 hover:bg-(--blue-light)/25"
            >
              <div className="grid gap-4 lg:grid-cols-[3.5rem_minmax(0,1fr)_8.5rem] lg:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--blue-light) text-(--primary-blue)">
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
                      <h2 className="truncate text-base font-black text-(--gray-900)">
                        {company.name}
                      </h2>
                      <p className="mt-1 truncate text-sm font-medium text-(--gray-500)">
                        {company.companyType || "Chưa cập nhật lĩnh vực"}
                      </p>
                    </div>
                    
                    {company.isVerified ? (
                      <span className="inline-flex h-7 w-28 items-center justify-center gap-1 rounded-full bg-(--accent-green)/10 px-2 text-xs font-bold text-(--accent-green)">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đã xác minh
                      </span>
                    ) : (
                      <span className="inline-flex h-7 w-28 items-center justify-center gap-1 rounded-full bg-(--accent-orange)/10 px-2 text-xs font-bold text-(--accent-orange)">
                        <CircleDashed className="h-3.5 w-3.5" />
                        Chờ xác minh
                      </span>
                    )}
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

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-(--gray-200) bg-(--gray-100)/60 px-3 py-2">
      <p className="text-xs font-semibold text-(--gray-500)">{label}</p>
      <p className="text-base font-black text-(--gray-900)">{value}</p>
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
    <span className="grid min-h-11 min-w-0 grid-cols-[2rem_1fr] items-center rounded-xl border border-(--gray-200) bg-(--gray-100)/45 px-2 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-(--gray-500)">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate pl-2 text-sm font-medium text-(--gray-700)">
        {value || "Chưa cập nhật"}
      </span>
    </span>
  );
}

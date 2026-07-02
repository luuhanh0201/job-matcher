"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Users,
} from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import { useEffect, useState } from "react";
import { getCompanyById } from "@/services/company.service";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function RecruiterCompanyDetailPage() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (!params.id) {
      setError("Không tìm thấy mã công ty");
      toast.error("Không tìm thấy mã công ty");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getCompanyById(params.id)
      .then((data) => setCompany(data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Không thể tải thông tin công ty";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm font-medium text-muted-foreground">
          Đang tải thông tin công ty...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground">
        Không thể tải thông tin công ty. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm font-medium text-muted-foreground">
          Không tìm thấy thông tin công ty.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/recruiter/company/list"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
          <h1 className="mt-3 text-2xl font-black text-foreground">
            Chi tiết công ty
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem thông tin doanh nghiệp đã đăng ký trong hệ thống.
          </p>
        </div>
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          
          
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-9 w-9" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-foreground">
                {company.name}
              </h2>
              {company.shortName ? (
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
                  {company.shortName}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {company.companyType || "Chưa cập nhật lĩnh vực"} ·{" "}
              {company.companySize} nhân sự
            </p>
          </div>
          
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailCard icon={Mail} label="Email" value={company.email} />
          <DetailCard icon={Phone} label="Số điện thoại" value={company.phone} />
          <DetailCard icon={ReceiptText} label="Mã số thuế" value={company.taxCode} />
          {
            company.website ? (
              <Link
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <DetailCard icon={Globe} label="Website" value={company.website} />
              </Link>
            ) : (
              <DetailCard icon={Globe} label="Website" value={company.website} />
            )
          }
          {
            company.linkedinUrl ? (
              <Link
                href={company.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <DetailCard icon={LinkIcon} label="LinkedIn" value={company.linkedinUrl} />
              </Link>
            ) : (
              <DetailCard icon={LinkIcon} label="LinkedIn" value={company.linkedinUrl} />
            )}
          {company.facebookUrl ? (
                     <Link
                      href={company.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      ><DetailCard icon={LinkIcon} label="Facebook" value={company.facebookUrl} /></Link>

          ) : (<DetailCard icon={LinkIcon} label="Facebook" value={company.facebookUrl} />)}
        </div>
        
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-black text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Giới thiệu công ty
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {company.description || "Chưa cập nhật mô tả công ty."}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-black text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Địa chỉ
          </h2>
          <p className="mt-3 rounded-xl border border-border bg-muted/60 px-3 py-3 text-sm font-medium leading-6 text-foreground">
            {[
              company.location?.address,
              company.location?.wardName,
              company.location?.provinceName,
            ]
              .filter(Boolean)
              .join(", ") || "Chưa cập nhật"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-black text-foreground">Thông tin hệ thống</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SystemInfo label="Trạng thái" value={company.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'} />
          <SystemInfo
            label="Ngày tạo"
            value={new Date(company.createdAt).toLocaleDateString("vi-VN")}
          />
          <SystemInfo
            label="Người tạo"
            value={company.createdBy?.name || "Chưa cập nhật"}
          />
        </div>
      </section>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <article className="rounded-xl border border-border p-3">
      <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </p>
      <p className="mt-1 wrap-break-word text-sm font-bold text-foreground">
        {value || "Chưa cập nhật"}
      </p>
    </article>
  );
}

function SystemInfo({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-foreground">{value}</p>
    </article>
  );
}

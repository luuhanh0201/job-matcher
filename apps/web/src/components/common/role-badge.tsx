import { UserRole } from "@/types/user-role.type";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; className: string }
> = {
  CANDIDATE: {
    label: "Ứng viên",
    className: "bg-primary/10 text-primary",
  },
  RECRUITER: {
    label: "Nhà tuyển dụng",
    className: "bg-success/10 text-success",
  },
  ADMIN: {
    label: "Quản trị viên",
    className: "bg-accent/10 text-accent",
  },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.CANDIDATE;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

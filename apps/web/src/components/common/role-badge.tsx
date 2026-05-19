import { UserRole } from "@/types/user-role.type";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; className: string }
> = {
  CANDIDATE: {
    label: "Ứng viên",
    className: "bg-(--blue-light) text-(--primary-blue)",
  },
  RECRUITER: {
    label: "Nhà tuyển dụng",
    className: "bg-(--accent-green)/10 text-(--accent-green)",
  },
  ADMIN: {
    label: "Quản trị viên",
    className: "bg-(--accent-purple)/10 text-(--accent-purple)",
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

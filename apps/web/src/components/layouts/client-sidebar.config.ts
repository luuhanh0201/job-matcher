import {
  Briefcase,
  Home,
  Hotel,
  MessageCircle,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { UserRole } from "@/types/user-role.type";

export type SubItem = {
  href: string;
  label: string;
};

export type NavItem = {
  href?: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  highlight?: boolean;
  children?: SubItem[];
};

const candidateNavItems: NavItem[] = [
  {
    icon: User,
    label: "Hồ sơ cá nhân",
    children: [
      { href: "/profile/me", label: "Thông tin cá nhân" },
      { href: "/profile/job-matches", label: "Công việc phù hợp" },
      { href: "/profile/security", label: "Bảo mật" },
    ],
  },
  {
    icon: Briefcase,
    label: "Việc làm",
    children: [
      { href: "/jobs/it", label: "IT-Phần mềm" },
      { href: "/jobs/sales", label: "Kinh doanh - bán hàng" },
      { href: "/jobs/hospitality", label: "Nhà hàng - khách sạn" },
      { href: "/jobs/education", label: "Giáo dục - đào tạo" },
      { href: "/jobs/general", label: "Việc làm phổ thông" },
    ],
  },
  { href: "/messages", icon: MessageCircle, label: "Tin nhắn", badge: 2 },
  { href: "/ai-cv", icon: Sparkles, label: "AI CV Analyzer", highlight: true },
];

const recruiterNavItems: NavItem[] = [
  {
    label: "Quản lý tuyển dụng",
    icon: Briefcase,
    children: [
      { href: "/recruiter/post-job", label: "Đăng tin tuyển dụng" },
      { href: "/recruiter/manage-jobs", label: "Quản lý tin tuyển dụng" },
      { href: "/recruiter/applications", label: "Quản lý ứng viên" },
      { href: "/recruiter/interviews", label: "Lịch hẹn phỏng vấn" },
    ],
  },
  {
    label: "Quản lý ứng viên",
    icon: Users,
    children: [
      { href: "/recruiter/candidates", label: "Danh sách ứng viên" },
      { href: "/recruiter/interviews", label: "Lịch phỏng vấn" },
    ],
  },
  { href: "/recruiter/messages", icon: MessageCircle, label: "Tin nhắn", badge: 5 },
  {
    href: "/recruiter/analytics",
    icon: Sparkles,
    label: "AI Candidate Finder",
    highlight: true,
  },
  { href: "/recruiter/company/profile", label: "Hồ sơ công ty", icon: Hotel },
];

const homeNavItem: NavItem = { href: "/", icon: Home, label: "Trang chủ" };
const recruiterHomeNavItem: NavItem = { href: "/recruiter", icon: Home, label: "Trang chủ" };
const settingsNavItem: NavItem = { href: "/settings", icon: Settings, label: "Cài đặt" };

export function getClientNavItems(role: UserRole | undefined): NavItem[] {
  if (role === "RECRUITER") {
    return [recruiterHomeNavItem, ...recruiterNavItems, settingsNavItem];
  }

  if (role === "CANDIDATE" || role === undefined) {
    return [homeNavItem, ...candidateNavItems, settingsNavItem];
  }

  return [];
}

export function getClientProfileHref(role: UserRole | undefined): string {
  if (role === "RECRUITER") {
    return "/recruiter/company/profile";
  }

  if (role === "CANDIDATE" || role === undefined) {
    return "/profile/me";
  }

  return "/";
}

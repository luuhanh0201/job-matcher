"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import LogoLight from "@/public/images/job-matcher-logo-light.svg";
import LogoDark from "@/public/images/job-matcher-logo-dark.svg";

type LogoProps = {
  className?: string;
  priority?: boolean;
  // "auto" đổi theo theme của app (mặc định); "light"/"dark" ép cố định — dùng khi
  // logo đặt trên nền màu cố định (vd hero panel gradient) không phụ thuộc theme.
  variant?: "auto" | "light" | "dark";
};

// Logo có 2 bản riêng cho nền sáng/tối (chữ và màu khác nhau), không thể tự đổi màu qua CSS.
export function Logo({ className, priority, variant = "auto" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    variant === "auto" ? mounted && resolvedTheme === "dark" : variant === "dark";

  return (
    <Image
      src={isDark ? LogoDark : LogoLight}
      alt="Job Matcher"
      className={className}
      priority={priority}
    />
  );
}

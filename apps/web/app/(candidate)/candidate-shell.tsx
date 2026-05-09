"use client";

import { useEffect, useState } from "react";
import { CandidateHeader } from "@/components/layouts/candidate-header";
import { CandidateSidebar } from "@/components/layouts/candidate-sidebar";

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-(--gray-100)">
      <CandidateHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <CandidateSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <button
        type="button"
        aria-label="Đóng menu"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <main className="pt-14 lg:pl-60">
        <div className="mx-auto w-full max-w-7xl p-3 sm:p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
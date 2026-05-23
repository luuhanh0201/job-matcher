import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { RecruiterShell } from "./recruiter-shell";

export const metadata: Metadata = {
  title: "Recruiter - Job Matcher",
};

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RecruiterShell>{children}</RecruiterShell>
    </AuthProvider>
  );
}

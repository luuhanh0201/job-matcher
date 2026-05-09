import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { CandidateShell } from './candidate-shell';

export const metadata: Metadata = {
  title: 'Job Matcher',
};

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CandidateShell>{children}</CandidateShell>
    </AuthProvider>
  );
}

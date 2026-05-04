import type { Metadata } from 'next';
import { CandidateHeader } from '@/components/layouts/candidate-header';
import { CandidateSidebar } from '@/components/layouts/candidate-sidebar';
import { AuthProvider } from '@/context/auth-context';

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
      <div className="min-h-screen bg-(--gray-100)">
        <CandidateHeader />
        <CandidateSidebar />
        <main className="ml-60 pt-14">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}

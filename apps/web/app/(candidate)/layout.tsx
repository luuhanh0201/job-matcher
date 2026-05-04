import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Matcher',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Navbar / Sidebar component */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Matcher – Xác thực',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" flex items-center justify-center bg-background">
      <div className="w-full overflow-auto lg:overflow-hidden">{children}</div>
    </div>
  );
}

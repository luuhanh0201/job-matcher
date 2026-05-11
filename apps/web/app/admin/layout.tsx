import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { AdminShell } from './admin-shell';

export const metadata: Metadata = {
    title: 'Admin Dashboard - Job Matcher',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AdminShell>{children}</AdminShell>
        </AuthProvider>
    );
}

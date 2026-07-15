import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/auth/cookies';
import { AdminLogin } from '@/lib/admin/AdminLogin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Masuk', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  if (currentSession('admin')) redirect('/admin');
  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminLogin />
    </div>
  );
}

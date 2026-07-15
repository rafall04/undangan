import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/auth/cookies';
import { AdminSettings } from '@/lib/admin/AdminSettings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Pengaturan', robots: { index: false, follow: false } };

export default function AdminSettingsPage() {
  const s = currentSession('admin');
  if (!s) redirect('/admin/login');
  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminSettings email={s.subject} />
    </div>
  );
}

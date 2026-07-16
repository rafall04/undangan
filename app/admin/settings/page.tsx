import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/auth/cookies';
import { AdminSettings } from '@/lib/admin/AdminSettings';
import { AdminAppSettings } from '@/lib/admin/AdminAppSettings';
import { AdminMusic } from '@/lib/admin/AdminMusic';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Pengaturan', robots: { index: false, follow: false } };

export default function AdminSettingsPage() {
  const s = currentSession('admin');
  if (!s) redirect('/admin/login');
  return (
    <div className="ui-page">
      <AdminSettings email={s.subject} />
      <div className="ui-container pb-10">
        <AdminAppSettings initial={getSettings()} />
        <AdminMusic initial={getSettings().musik} />
      </div>
    </div>
  );
}

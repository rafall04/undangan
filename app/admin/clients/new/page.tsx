import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/auth/cookies';
import { AdminCreateClient } from '@/lib/admin/AdminCreateClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Undangan Baru', robots: { index: false, follow: false } };

export default function NewClientPage() {
  if (!currentSession('admin')) redirect('/admin/login');
  return (
    <div className="ui-page">
      <AdminCreateClient />
    </div>
  );
}

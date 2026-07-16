import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { currentSession } from '@/lib/auth/cookies';
import { CLIENTS_DIR, loadClient } from '@/lib/clients/load';
import { pasanganPanggilan } from '@/lib/invitation/types';
import { getMeta } from '@/lib/clients/meta';
import { getRsvpRecap } from '@/lib/clients/rsvp';
import { AdminClientEditor } from '@/lib/admin/AdminClientEditor';
import { RsvpRecap } from '@/lib/kirim/RsvpRecap';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Kelola Undangan', robots: { index: false, follow: false } };

export default function AdminClientPage({ params }: { params: { slug: string } }) {
  if (!currentSession('admin')) redirect('/admin/login');

  const file = join(CLIENTS_DIR, params.slug, 'config.json');
  if (!existsSync(file)) notFound();
  const initialJson = readFileSync(file, 'utf8');

  const meta = getMeta(params.slug);
  const recap = getRsvpRecap(params.slug);

  let judul = params.slug;
  try {
    const b = loadClient(params.slug);
    if (b) {
      const [a, c] = pasanganPanggilan(b.data);
      judul = `${a} & ${c}`;
    }
  } catch {
    /* config mungkin sedang bermasalah — tetap tampilkan editor untuk diperbaiki */
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminClientEditor
        slug={params.slug}
        judul={judul}
        initialJson={initialJson}
        initialStatus={meta?.status ?? 'published'}
        initialPaket={meta?.paket ?? null}
        initialExpiresAt={meta?.expires_at ?? null}
        rsvpCount={recap.total}
      />
      {/* Admin melihat daftar RSVP masuk */}
      <div className="pb-10">
        <RsvpRecap recap={recap} />
      </div>
    </div>
  );
}

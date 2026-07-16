import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadClient, loadGuests } from '@/lib/clients/load';
import { pasanganPanggilan } from '@/lib/invitation/types';
import { KirimTool } from '@/lib/kirim/KirimTool';
import { ClientLogin, ClientLogoutButton } from '@/lib/kirim/ClientLogin';
import { RsvpRecap } from '@/lib/kirim/RsvpRecap';
import { getRsvpRecap } from '@/lib/clients/rsvp';
import { defaultTemplate } from '@/lib/kirim/utils';
import { currentSession } from '@/lib/auth/cookies';

export const metadata: Metadata = {
  title: 'Alat Kirim Undangan',
  robots: { index: false, follow: false },
};

// Terproteksi sesi (cookie) → selalu dinamis, tidak di-prerender.
export const dynamic = 'force-dynamic';

export default function KirimPage({ params }: { params: { client: string } }) {
  const bundle = loadClient(params.client);
  if (!bundle) notFound();

  const [a, b] = pasanganPanggilan(bundle.data);
  const judul = `${a} & ${b}`;

  const session = currentSession('client');
  const authed = session?.subject === params.client;

  return (
    <div className="ui-page">
      <header className="ui-topbar">
        <div className="ui-container flex max-w-3xl flex-wrap items-center justify-between gap-2 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">R</span>
            <span className="text-sm font-semibold text-slate-900">Rafayana</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/u/${params.client}`} className="ui-btn ui-btn-secondary whitespace-nowrap">
              Lihat Undangan
            </Link>
            {authed && <ClientLogoutButton />}
          </div>
        </div>
      </header>

      {!authed ? (
        <ClientLogin slug={params.client} judul={judul} />
      ) : (
        <>
          <RsvpRecap recap={getRsvpRecap(params.client)} />
          <KirimTool
            basePath={`/u/${params.client}`}
            judul={judul}
            defaultTemplate={bundle.cfg.templatePesan ?? defaultTemplate()}
            initialTamu={loadGuests(params.client, bundle.cfg)}
            slug={params.client}
          />
        </>
      )}
    </div>
  );
}

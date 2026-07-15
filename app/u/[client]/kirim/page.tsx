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
import { Wordmark } from '@/lib/site/Wordmark';

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
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-brand-line bg-brand-cream/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/">
            <Wordmark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/u/${params.client}`}
              className="rounded-full border border-brand-line px-4 py-1.5 text-sm text-brand-ink hover:border-brand-gold"
            >
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

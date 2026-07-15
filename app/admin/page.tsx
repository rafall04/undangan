import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentSession } from '@/lib/auth/cookies';
import { listAdminClients, listOrders } from '@/lib/admin/queries';
import { AdminLogoutButton } from '@/lib/admin/AdminLogin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Dashboard', robots: { index: false, follow: false } };

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-green-600/12 text-green-800',
  draft: 'bg-amber-600/14 text-amber-800',
  disabled: 'bg-red-600/12 text-red-800',
};
const STATUS_LABEL: Record<string, string> = {
  published: 'Terbit',
  draft: 'Draft',
  disabled: 'Nonaktif',
};

function tglAcara(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-brand-paper px-5 py-4">
      <div className="font-brand-serif text-3xl font-semibold text-brand-ink">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-brand-muted">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const s = currentSession('admin');
  if (!s) redirect('/admin/login');

  const clients = listAdminClients();
  const orders = listOrders();
  const totalRsvp = clients.reduce((n, c) => n + c.rsvp, 0);

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-brand-line bg-brand-cream/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="font-brand-script text-2xl leading-none text-brand-gold">Rafayana</p>
            <p className="text-xs text-brand-muted">Panel Admin · {s.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/clients/new"
              className="rounded-full bg-brand-ink px-4 py-1.5 text-sm font-medium text-brand-cream hover:opacity-90"
            >
              + Undangan Baru
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Undangan" value={clients.length} />
          <Stat label="Total RSVP" value={totalRsvp} />
          <Stat label="Pesanan" value={orders.length} />
        </div>

        {/* Undangan */}
        <section className="mt-8">
          <h2 className="font-brand-serif text-lg font-semibold text-brand-ink">Undangan</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-brand-paper text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-4 py-3">Pasangan</th>
                  <th className="px-4 py-3">Tema</th>
                  <th className="px-4 py-3">Acara</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">RSVP</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                      Belum ada undangan. Klik “+ Undangan Baru”.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr key={c.slug} className="bg-brand-cream/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-brand-ink">{c.judul}</div>
                        <div className="text-xs text-brand-muted">/{c.slug}</div>
                        {!c.valid && <span className="text-xs text-red-600">config bermasalah</span>}
                      </td>
                      <td className="px-4 py-3 text-brand-muted">{c.tema}</td>
                      <td className="px-4 py-3 text-brand-muted">{tglAcara(c.tanggalUtama)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[c.status] ?? ''}`}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-muted">
                        {c.rsvp} <span className="text-xs">({c.hadir} hadir)</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2 text-xs">
                          <Link href={`/admin/clients/${c.slug}`} className="text-brand-gold hover:underline">
                            Kelola
                          </Link>
                          <Link href={`/u/${c.slug}`} target="_blank" className="text-brand-ink hover:underline">
                            Lihat
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pesanan */}
        <section className="mt-8">
          <h2 className="font-brand-serif text-lg font-semibold text-brand-ink">Pesanan / Lead</h2>
          {orders.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-brand-line py-8 text-center text-sm text-brand-muted">
              Belum ada pesanan. Pesanan dari Studio (“Ajukan”) akan muncul di sini.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-line">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-brand-paper text-xs uppercase tracking-wide text-brand-muted">
                  <tr>
                    <th className="px-4 py-3">Pemesan</th>
                    <th className="px-4 py-3">Kontak</th>
                    <th className="px-4 py-3">Paket</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {orders.map((o) => (
                    <tr key={o.id} className="bg-brand-cream/40">
                      <td className="px-4 py-3 text-brand-ink">{o.nama_pemesan ?? '—'}</td>
                      <td className="px-4 py-3 text-brand-muted">{o.kontak ?? '—'}</td>
                      <td className="px-4 py-3 text-brand-muted">{o.paket ?? '—'}</td>
                      <td className="px-4 py-3 text-brand-muted">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentSession } from '@/lib/auth/cookies';
import { listAdminClients, listOrders } from '@/lib/admin/queries';
import { AdminLogoutButton } from '@/lib/admin/AdminLogin';
import { AdminClientsTable } from '@/lib/admin/AdminClientsTable';
import { OrderActions } from '@/lib/admin/OrderActions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin — Dashboard', robots: { index: false, follow: false } };

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
            <Link
              href="/admin/settings"
              className="rounded-full border border-brand-line px-4 py-1.5 text-sm text-brand-ink hover:border-brand-gold"
            >
              Pengaturan
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

        {/* Undangan (cari + filter + sort di komponen) */}
        <section className="mt-8">
          <h2 className="mb-3 font-brand-serif text-lg font-semibold text-brand-ink">Undangan</h2>
          <AdminClientsTable rows={clients} />
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
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-brand-paper text-xs uppercase tracking-wide text-brand-muted">
                  <tr>
                    <th className="px-4 py-3">Pemesan</th>
                    <th className="px-4 py-3">Kontak</th>
                    <th className="px-4 py-3">Paket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {orders.map((o) => (
                    <tr key={o.id} className="bg-brand-cream/40">
                      <td className="px-4 py-3 text-brand-ink">{o.nama_pemesan ?? '—'}</td>
                      <td className="px-4 py-3 text-brand-muted">{o.kontak ?? '—'}</td>
                      <td className="px-4 py-3 text-brand-muted">{o.paket ?? '—'}</td>
                      <td className="px-4 py-3 text-brand-muted">{o.status}</td>
                      <td className="px-4 py-3">
                        <OrderActions order={o} />
                      </td>
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

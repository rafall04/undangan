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
    <div className="ui-card p-4 sm:p-5">
      <div className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">{label}</div>
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
    <div className="ui-page">
      <header className="ui-topbar">
        <div className="ui-container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">R</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900">Rafayana Admin</p>
              <p className="truncate text-xs text-slate-500">{s.subject}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/clients/new" className="ui-btn ui-btn-primary whitespace-nowrap">
              + Undangan Baru
            </Link>
            <Link href="/admin/settings" className="ui-btn ui-btn-secondary whitespace-nowrap">
              Pengaturan
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="ui-container py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Stat label="Undangan" value={clients.length} />
          <Stat label="Total RSVP" value={totalRsvp} />
          <Stat label="Pesanan" value={orders.length} />
        </div>

        {/* Undangan */}
        <section className="mt-8">
          <h2 className="ui-title mb-3">Undangan</h2>
          <AdminClientsTable rows={clients} />
        </section>

        {/* Pesanan */}
        <section className="mt-8">
          <h2 className="ui-title mb-3">Pesanan / Lead</h2>
          {orders.length === 0 ? (
            <div className="ui-card border-dashed py-10 text-center text-sm text-slate-500">
              Belum ada pesanan. Pesanan dari Studio (“Ajukan”) akan muncul di sini.
            </div>
          ) : (
            <>
              {/* Mobile (< sm): kartu pesanan */}
              <div className="grid gap-3 sm:hidden">
                {orders.map((o) => (
                  <div key={o.id} className="ui-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800">{o.nama_pemesan ?? '—'}</div>
                        <div className="truncate text-xs text-slate-500">{o.kontak ?? '—'}</div>
                      </div>
                      <span className="ui-badge shrink-0 bg-slate-100 capitalize text-slate-600">{o.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Paket: <span className="text-slate-700">{o.paket ?? '—'}</span>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <OrderActions order={o} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop (sm+): tabel */}
              <div className="ui-card hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="ui-th">Pemesan</th>
                    <th className="ui-th">Kontak</th>
                    <th className="ui-th">Paket</th>
                    <th className="ui-th">Status</th>
                    <th className="ui-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="ui-td font-medium text-slate-800">{o.nama_pemesan ?? '—'}</td>
                      <td className="ui-td text-slate-500">{o.kontak ?? '—'}</td>
                      <td className="ui-td text-slate-500">{o.paket ?? '—'}</td>
                      <td className="ui-td text-slate-500 capitalize">{o.status}</td>
                      <td className="ui-td text-right">
                        <OrderActions order={o} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

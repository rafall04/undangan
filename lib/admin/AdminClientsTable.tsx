'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { AdminClientRow } from './queries';

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-green-600/12 text-green-800',
  draft: 'bg-amber-600/14 text-amber-800',
  disabled: 'bg-red-600/12 text-red-800',
};
const STATUS_LABEL: Record<string, string> = { published: 'Terbit', draft: 'Draft', disabled: 'Nonaktif' };

function tglAcara(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

type SortKey = 'judul' | 'acara' | 'rsvp';

export function AdminClientsTable({ rows }: { rows: AdminClientRow[] }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('judul');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let r = rows.filter(
      (c) =>
        (!t || c.judul.toLowerCase().includes(t) || c.slug.includes(t)) &&
        (!statusFilter || c.status === statusFilter),
    );
    r = r.slice().sort((a, b) => {
      if (sort === 'rsvp') return b.rsvp - a.rsvp;
      if (sort === 'acara') return (a.tanggalUtama || '').localeCompare(b.tanggalUtama || '');
      return a.judul.localeCompare(b.judul);
    });
    return r;
  }, [rows, q, sort, statusFilter]);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama / slug…"
          className="w-48 rounded-full border border-brand-line bg-brand-paper px-4 py-1.5 text-sm outline-none focus:border-brand-gold"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-brand-line bg-brand-paper px-3 py-1.5 text-sm"
        >
          <option value="">Semua status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
          <option value="disabled">Nonaktif</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-full border border-brand-line bg-brand-paper px-3 py-1.5 text-sm"
        >
          <option value="judul">Urut: Nama</option>
          <option value="acara">Urut: Tanggal acara</option>
          <option value="rsvp">Urut: RSVP terbanyak</option>
        </select>
        <span className="text-xs text-brand-muted">{filtered.length} undangan</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-line">
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">
                  {rows.length === 0 ? 'Belum ada undangan. Klik “+ Undangan Baru”.' : 'Tidak ada yang cocok.'}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
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
    </>
  );
}

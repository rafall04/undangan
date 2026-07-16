'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { AdminClientRow } from './queries';

const STATUS_BADGE: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  disabled: 'bg-slate-200 text-slate-600',
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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / slug…" className="ui-input w-56" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ui-input w-auto">
          <option value="">Semua status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
          <option value="disabled">Nonaktif</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="ui-input w-auto">
          <option value="judul">Urut: Nama</option>
          <option value="acara">Urut: Tanggal acara</option>
          <option value="rsvp">Urut: RSVP terbanyak</option>
        </select>
        <span className="text-xs text-slate-500">{filtered.length} undangan</span>
      </div>

      <div className="ui-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="ui-th">Pasangan</th>
              <th className="ui-th">Tema</th>
              <th className="ui-th">Acara</th>
              <th className="ui-th">Status</th>
              <th className="ui-th">RSVP</th>
              <th className="ui-th text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {rows.length === 0 ? 'Belum ada undangan. Klik “+ Undangan Baru”.' : 'Tidak ada yang cocok.'}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.slug} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="ui-td">
                    <div className="font-medium text-slate-900">{c.judul}</div>
                    <div className="text-xs text-slate-400">/{c.slug}</div>
                    {!c.valid && <span className="text-xs text-red-600">config bermasalah</span>}
                  </td>
                  <td className="ui-td text-slate-500">{c.tema}</td>
                  <td className="ui-td text-slate-500">{tglAcara(c.tanggalUtama)}</td>
                  <td className="ui-td">
                    <span className={`ui-badge ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="ui-td text-slate-600">
                    <span className="font-medium text-slate-900">{c.rsvp}</span> <span className="text-xs text-slate-400">({c.hadir} hadir)</span>
                  </td>
                  <td className="ui-td">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/clients/${c.slug}`} className="ui-link">
                        Kelola
                      </Link>
                      <Link href={`/u/${c.slug}`} target="_blank" className="font-medium text-slate-500 hover:text-slate-800">
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

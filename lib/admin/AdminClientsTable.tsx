'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Halaman dipotong SETELAH filter/sort → nomor halaman selalu relevan dengan
  // hasil yang sedang dilihat. Kembali ke hal. 1 bila kriteria berubah.
  useEffect(() => setPage(1), [q, statusFilter, sort, pageSize]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const shown = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / slug…" className="ui-input sm:w-56" />
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ui-input w-full sm:w-auto">
            <option value="">Semua status</option>
            <option value="published">Terbit</option>
            <option value="draft">Draft</option>
            <option value="disabled">Nonaktif</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="ui-input w-full sm:w-auto">
            <option value="judul">Urut: Nama</option>
            <option value="acara">Urut: Tanggal acara</option>
            <option value="rsvp">Urut: RSVP terbanyak</option>
          </select>
        </div>
        <span className="text-xs text-slate-500 sm:ml-1">
          {total === 0 ? '0 undangan' : `${from}–${to} dari ${total} undangan`}
        </span>
      </div>

      {/* Mobile (< sm): daftar kartu — tabel menyembunyikan diri agar tidak meluber */}
      <div className="grid gap-3 sm:hidden">
        {filtered.length === 0 ? (
          <div className="ui-card p-6 text-center text-sm text-slate-500">
            {rows.length === 0 ? 'Belum ada undangan. Klik “+ Undangan Baru”.' : 'Tidak ada yang cocok.'}
          </div>
        ) : (
          shown.map((c) => (
            <div key={c.slug} className="ui-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900">{c.judul}</div>
                  <div className="truncate text-xs text-slate-400">/{c.slug}</div>
                </div>
                <span className={`ui-badge shrink-0 ${STATUS_BADGE[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
              </div>
              {!c.valid && <p className="mt-2 text-xs text-red-600">config bermasalah</p>}
              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">Tema</dt>
                  <dd className="mt-0.5 text-slate-600">{c.tema}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">Acara</dt>
                  <dd className="mt-0.5 text-slate-600">{tglAcara(c.tanggalUtama)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">RSVP</dt>
                  <dd className="mt-0.5 text-slate-600">
                    <span className="font-medium text-slate-900">{c.rsvp}</span>{' '}
                    <span className="text-xs text-slate-400">({c.hadir})</span>
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Link href={`/admin/clients/${c.slug}`} className="ui-btn ui-btn-primary flex-1">
                  Kelola
                </Link>
                <Link href={`/u/${c.slug}`} target="_blank" className="ui-btn ui-btn-secondary flex-1">
                  Lihat
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop (sm+): tabel penuh */}
      <div className="ui-card hidden overflow-x-auto sm:block">
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
              shown.map((c) => (
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

      {/* Navigasi halaman — hanya tampil bila memang lebih dari 1 halaman. */}
      {pages > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Tampilkan
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ui-input w-auto py-1 text-xs"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            per halaman
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs"
            >
              ← Sebelumnya
            </button>
            <span className="text-xs text-slate-500">
              Hal. {current}/{pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={current >= pages}
              className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

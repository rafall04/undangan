'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RsvpRecapData, RsvpEntry } from '@/lib/clients/rsvp';
import { downloadDataUrl } from './qr';

// ============================================================================
// Rekap RSVP & ucapan — dipakai di portal client & editor admin.
// Terstruktur: ringkasan angka → saring/cari → daftar dengan moderasi.
// Menyembunyikan bersifat reversible (kolom `hidden`), bukan menghapus.
// ============================================================================

const LABEL: Record<string, string> = { hadir: 'Hadir', tidak: 'Tidak Hadir', ragu: 'Masih Ragu' };
const BADGE: Record<string, string> = {
  hadir: 'bg-emerald-100 text-emerald-700',
  tidak: 'bg-red-100 text-red-700',
  ragu: 'bg-amber-100 text-amber-700',
};

type Filter = 'semua' | 'hadir' | 'tidak' | 'ragu' | 'tersembunyi';

function tanggal(ms: number): string {
  return new Date(ms).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Stat({ label, value, tone, hint }: { label: string; value: number; tone?: string; hint?: string }) {
  return (
    <div className="ui-card p-4 text-center">
      <div className={`text-2xl font-semibold ${tone ?? 'text-slate-900'}`}>{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-slate-400">{hint}</div>}
    </div>
  );
}

/** CSV dengan quoting aman (koma/kutip di pesan tidak merusak kolom). */
function toCSV(rows: RsvpEntry[]): string {
  const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const head = ['Nama', 'Kehadiran', 'Jumlah Orang', 'Pesan', 'Waktu', 'Status'].map(q).join(',');
  const body = rows
    .map((r) =>
      [
        q(r.nama),
        q(LABEL[r.kehadiran] ?? r.kehadiran),
        q(String(r.jumlah ?? '')),
        q(r.pesan ?? ''),
        q(tanggal(r.created_at)),
        q(r.hidden ? 'Disembunyikan' : 'Tampil'),
      ].join(','),
    )
    .join('\r\n');
  return `${head}\r\n${body}\r\n`;
}

export function RsvpRecap({ recap, slug }: { recap: RsvpRecapData; slug?: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('semua');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  // Status moderasi optimistik → daftar tak "melompat" menunggu server.
  const [override, setOverride] = useState<Record<number, boolean>>({});

  const isHidden = (e: RsvpEntry) => override[e.id] ?? Boolean(e.hidden);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return recap.entries.filter((e) => {
      if (filter === 'tersembunyi' ? !isHidden(e) : filter !== 'semua' && e.kehadiran !== filter) return false;
      if (filter !== 'tersembunyi' && filter !== 'semua' && isHidden(e)) return false;
      if (!t) return true;
      return e.nama.toLowerCase().includes(t) || (e.pesan ?? '').toLowerCase().includes(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recap.entries, filter, q, override]);

  async function toggleHide(e: RsvpEntry) {
    if (!slug) return;
    const next = !isHidden(e);
    setBusy(e.id);
    setOverride((o) => ({ ...o, [e.id]: next }));
    try {
      const res = await fetch('/api/rsvp/manage', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, id: e.id, hidden: next }),
      });
      if (!res.ok) setOverride((o) => ({ ...o, [e.id]: !next })); // rollback
      else router.refresh();
    } catch {
      setOverride((o) => ({ ...o, [e.id]: !next }));
    } finally {
      setBusy(null);
    }
  }

  function exportCSV() {
    const blob = new Blob([toCSV(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `rsvp-${slug ?? 'undangan'}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  const TABS: Array<{ id: Filter; label: string; n: number }> = [
    { id: 'semua', label: 'Semua', n: recap.total },
    { id: 'hadir', label: 'Hadir', n: recap.hadir },
    { id: 'tidak', label: 'Tidak', n: recap.tidak },
    { id: 'ragu', label: 'Ragu', n: recap.ragu },
    { id: 'tersembunyi', label: 'Disembunyikan', n: recap.tersembunyi },
  ];

  return (
    <section className="ui-container max-w-3xl pt-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="ui-title text-base">Rekap RSVP &amp; Ucapan</h2>
        <button onClick={exportCSV} disabled={filtered.length === 0} className="ui-btn ui-btn-secondary">
          Ekspor CSV ({filtered.length})
        </button>
      </div>

      {/* Ringkasan */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total RSVP" value={recap.total} />
        <Stat label="Hadir" value={recap.hadir} tone="text-emerald-600" />
        <Stat label="Tidak Hadir" value={recap.tidak} tone="text-red-600" />
        <Stat
          label="Estimasi Orang"
          value={recap.estimasiHadir}
          tone="text-amber-600"
          hint="untuk katering/kursi"
        />
      </div>

      {/* Saring + cari */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === t.id ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label} <span className="opacity-70">{t.n}</span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama / isi ucapan…"
          className="ui-input sm:ml-auto sm:w-56"
        />
      </div>

      {/* Daftar */}
      {filtered.length === 0 ? (
        <div className="ui-card mt-4 border-dashed py-8 text-center text-sm text-slate-500">
          {recap.total === 0
            ? 'Belum ada RSVP masuk. Balasan tamu akan muncul di sini otomatis.'
            : 'Tidak ada yang cocok dengan filter/pencarian.'}
        </div>
      ) : (
        <ul className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {filtered.map((e) => {
            const hidden = isHidden(e);
            return (
              <li key={e.id} className={`ui-card p-3 ${hidden ? 'opacity-60' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {e.nama}
                    {e.jumlah ? <span className="ml-1 text-xs font-normal text-slate-400">· {e.jumlah} orang</span> : null}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hidden && <span className="ui-badge bg-slate-200 text-slate-600">Disembunyikan</span>}
                    <span className={`ui-badge ${BADGE[e.kehadiran] ?? 'bg-slate-100 text-slate-600'}`}>
                      {LABEL[e.kehadiran] ?? e.kehadiran}
                    </span>
                  </div>
                </div>
                {e.pesan && <p className="mt-1 text-sm leading-relaxed text-slate-600">{e.pesan}</p>}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-slate-400">{tanggal(e.created_at)}</p>
                  {slug && (
                    <button
                      onClick={() => toggleHide(e)}
                      disabled={busy === e.id}
                      className="rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50"
                    >
                      {busy === e.id ? '…' : hidden ? 'Tampilkan lagi' : 'Sembunyikan'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {slug && (
        <p className="mt-2 text-[11px] text-slate-400">
          “Sembunyikan” hanya menutup ucapan dari halaman undangan — datanya tetap tersimpan dan bisa ditampilkan lagi.
        </p>
      )}
    </section>
  );
}

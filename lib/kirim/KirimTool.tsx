'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BRAND } from '@/lib/brand';
import {
  type Tamu,
  parseGuests,
  dedupeGuests,
  buildMessage,
  personalLink,
  waUrl,
  statusKey,
  toCSV,
} from './utils';
import { qrDataUrl, downloadDataUrl } from './qr';

// ============================================================================
// FASE 5 — Alat kirim massal & manajemen tamu (client).
// Dua mode:
//  • Server (undangan klien, ada `slug`): daftar tamu + status kirim tersimpan
//    di DB via /api/client/guests → sinkron lintas-device.
//  • Lokal (demo tema / tanpa slug): in-memory + localStorage (tanpa backend).
// Pengiriman TETAP manual per tamu (tanpa otomasi).
// ============================================================================

type Row = Tamu & { id?: number; sent?: boolean };

interface Props {
  basePath: string; // mis. "/u/budi-sari" atau "/tema/kawung-ratri"
  judul: string;
  defaultTemplate: string;
  initialTamu?: Tamu[];
  isDemo?: boolean;
  /** Slug undangan klien nyata → daftar tamu & status disimpan di server. */
  slug?: string;
}

export function KirimTool({ basePath, judul, defaultTemplate, initialTamu = [], isDemo = false, slug }: Props) {
  const storeId = `rafayana:kirim:${basePath}`;
  const serverMode = Boolean(slug) && !isDemo;

  const [origin, setOrigin] = useState(BRAND.baseUrl);
  const [tamu, setTamu] = useState<Row[]>(initialTamu);
  const [paste, setPaste] = useState('');
  const [template, setTemplate] = useState(defaultTemplate);
  const [status, setStatus] = useState<Record<string, boolean>>({}); // hanya mode lokal
  const [copied, setCopied] = useState('');
  const [qrTarget, setQrTarget] = useState<{ label: string; url: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncErr, setSyncErr] = useState(false);

  const isSent = (t: Row): boolean => (serverMode ? Boolean(t.sent) : Boolean(status[statusKey(t.nama)]));

  // ---- Muat awal ----
  useEffect(() => {
    setOrigin(window.location.origin);

    // Template selalu boleh dari localStorage (kosmetik, per-basePath).
    try {
      const raw = localStorage.getItem(storeId);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.template === 'string') setTemplate(saved.template);
        if (!serverMode && !isDemo) {
          if (Array.isArray(saved.tamu) && saved.tamu.length) setTamu(saved.tamu);
          if (saved.status && typeof saved.status === 'object') setStatus(saved.status);
        }
      }
    } catch {
      /* abaikan */
    }

    if (!serverMode) {
      setHydrated(true);
      return;
    }

    // Mode server: ambil tamu dari DB; seed sekali dari config bila kosong.
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/client/guests', { cache: 'no-store' });
        const j = (await res.json()) as { ok?: boolean; guests?: Row[] };
        let guests = res.ok && j.ok && Array.isArray(j.guests) ? j.guests : [];
        if (!guests.length && initialTamu.length) {
          const seed = await fetch('/api/client/guests', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ guests: initialTamu }),
          });
          const sj = (await seed.json()) as { ok?: boolean; guests?: Row[] };
          if (seed.ok && sj.ok && Array.isArray(sj.guests)) guests = sj.guests;
        }
        if (alive) setTamu(guests);
      } catch {
        if (alive) setSyncErr(true);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Simpan (template selalu; tamu/status hanya mode lokal) ----
  useEffect(() => {
    if (!hydrated || isDemo) return;
    try {
      const payload = serverMode ? { template } : { tamu, template, status };
      localStorage.setItem(storeId, JSON.stringify(payload));
    } catch {
      /* abaikan */
    }
  }, [tamu, template, status, hydrated, isDemo, serverMode, storeId]);

  const terkirim = useMemo(() => tamu.filter(isSent).length, [tamu, status]); // eslint-disable-line react-hooks/exhaustive-deps

  function copy(id: string, text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? '' : c)), 1400);
    });
  }

  async function tambahDariPaste() {
    const parsed = parseGuests(paste);
    if (!parsed.length) return;
    if (serverMode) {
      try {
        const res = await fetch('/api/client/guests', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ guests: parsed }),
        });
        const j = (await res.json()) as { ok?: boolean; guests?: Row[] };
        if (res.ok && j.ok && Array.isArray(j.guests)) setTamu(j.guests);
        else setSyncErr(true);
      } catch {
        setSyncErr(true);
      }
    } else {
      setTamu((prev) => dedupeGuests([...prev, ...parsed]));
    }
    setPaste('');
  }

  async function hapusTamu(t: Row) {
    if (serverMode && t.id != null) {
      try {
        await fetch(`/api/client/guests?id=${t.id}`, { method: 'DELETE' });
      } catch {
        setSyncErr(true);
      }
      setTamu((prev) => prev.filter((x) => x.id !== t.id));
    } else {
      setTamu((prev) => prev.filter((x) => x.nama !== t.nama));
    }
  }

  async function toggleSent(t: Row, val?: boolean) {
    const next = val ?? !isSent(t);
    if (serverMode && t.id != null) {
      setTamu((prev) => prev.map((x) => (x.id === t.id ? { ...x, sent: next } : x)));
      try {
        await fetch('/api/client/guests', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: t.id, sent: next }),
        });
      } catch {
        setSyncErr(true);
      }
    } else {
      setStatus((s) => ({ ...s, [statusKey(t.nama)]: next }));
    }
  }

  function unduhCSV() {
    const rows = tamu.map((t) => ({
      nama: t.nama,
      telepon: t.telepon,
      link: personalLink(origin, basePath, t.nama),
      terkirim: isSent(t),
    }));
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `tamu-${basePath.replace(/\W+/g, '-').replace(/^-|-$/g, '')}.csv`);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function bukaQR(label: string, url: string) {
    const dataUrl = await qrDataUrl(url);
    setQrTarget({ label, url: dataUrl });
  }

  const linkUmum = `${origin}${basePath}`;
  const previewTamu = tamu[0] ?? { nama: 'Bapak/Ibu Contoh' };
  const previewLink = personalLink(origin, basePath, previewTamu.nama);
  const previewPesan = buildMessage(template, previewTamu.nama, previewLink);

  return (
    <div className="ui-container max-w-3xl py-8">
      {/* Header */}
      <div>
        {isDemo && (
          <span className="mb-2 inline-block rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            MODE DEMO — data contoh
          </span>
        )}
        <p className="ui-eyebrow">Alat Kirim Undangan</p>
        <h1 className="ui-title mt-1 text-2xl">{judul}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sebar undangan ke tamu dengan rapi — tautan personal, template pesan, &amp; QR code.
        </p>
        {serverMode && (
          <p className="mt-1 text-xs text-emerald-600">✓ Daftar tamu tersimpan otomatis di server (sinkron lintas-perangkat).</p>
        )}
        {syncErr && <p className="mt-1 text-xs text-red-600">⚠ Sebagian perubahan gagal disinkron. Cek koneksi.</p>}
      </div>

      {/* Catatan penting */}
      <div className="ui-card mt-6 px-5 py-4 text-sm text-slate-700">
        <p className="font-medium">ℹ️ Pengiriman dilakukan manual per tamu (satu klik per tamu).</p>
        <p className="mt-1 text-slate-500">
          Ini disengaja agar akun WhatsApp Anda aman dari pemblokiran. Kami tidak melakukan otomasi
          kirim massal.
        </p>
      </div>

      {/* Impor tamu */}
      <section className="mt-8">
        <h2 className="ui-title text-base">1. Tambah Daftar Tamu</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tempel dari Excel/Notes — satu tamu per baris. Format: <code className="rounded bg-slate-100 px-1">Nama</code> atau{' '}
          <code className="rounded bg-slate-100 px-1">Nama, 08xxxxxxxxxx</code>.
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder={'Bapak Andi Wijaya, 081234567890\nIbu Siti Rahayu\nRudi Hartanto, 0856-1112-2233'}
          className="ui-input mt-3 min-h-[110px]"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button onClick={tambahDariPaste} className="ui-btn ui-btn-primary">
            Tambah ke daftar
          </button>
          <span className="text-sm text-slate-500">{tamu.length} tamu di daftar</span>
        </div>
      </section>

      {/* Template pesan */}
      <section className="mt-8">
        <h2 className="ui-title text-base">2. Template Pesan</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gunakan <code className="rounded bg-slate-100 px-1">{'{nama}'}</code> dan <code className="rounded bg-slate-100 px-1">{'{link}'}</code> — otomatis terisi per tamu.
        </p>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="ui-input mt-3 min-h-[150px]"
        />
        <div className="mt-2 flex items-center gap-3">
          <button onClick={() => setTemplate(defaultTemplate)} className="ui-link text-xs">
            Kembalikan template default
          </button>
        </div>
        <details className="ui-card mt-3 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Preview untuk tamu pertama ({previewTamu.nama})
          </summary>
          <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-500">{previewPesan}</pre>
        </details>
      </section>

      {/* Progres & toolbar */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="ui-title text-base">3. Kirim & Lacak</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => bukaQR('Undangan Umum', linkUmum)} className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs">
              QR Undangan Umum
            </button>
            <button onClick={unduhCSV} className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs">
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{terkirim}/{tamu.length} terkirim</span>
            <span>{tamu.length ? Math.round((terkirim / tamu.length) * 100) : 0}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${tamu.length ? (terkirim / tamu.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Tabel tamu */}
        {tamu.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
            Belum ada tamu. Tambahkan lewat kotak di atas.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {tamu.map((t) => {
              const link = personalLink(origin, basePath, t.nama);
              const pesan = buildMessage(template, t.nama, link);
              const sent = isSent(t);
              const rowKey = t.id != null ? `id-${t.id}` : t.nama;
              return (
                <li
                  key={rowKey}
                  className={`rounded-lg border px-4 py-3 ${sent ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sent}
                          onChange={() => toggleSent(t)}
                          className="h-4 w-4 accent-emerald-600"
                          aria-label={`Tandai ${t.nama} terkirim`}
                        />
                        <span className="truncate font-medium text-slate-900">{t.nama}</span>
                        {t.grup && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{t.grup}</span>}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {t.telepon ? `📱 ${t.telepon} · ` : ''}
                        {link}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.telepon ? (
                      <a
                        href={waUrl(t.telepon, pesan)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => toggleSent(t, true)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.3.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .1 0 .7-.1 1.1Z" />
                        </svg>
                        Kirim WA
                      </a>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-500">Tanpa nomor</span>
                    )}
                    <button onClick={() => copy(`link-${rowKey}`, link)} className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs">
                      {copied === `link-${rowKey}` ? 'Tersalin ✓' : 'Salin Link'}
                    </button>
                    <button onClick={() => copy(`msg-${rowKey}`, pesan)} className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs">
                      {copied === `msg-${rowKey}` ? 'Tersalin ✓' : 'Salin Pesan'}
                    </button>
                    <button onClick={() => bukaQR(t.nama, link)} className="ui-btn ui-btn-secondary px-3 py-1.5 text-xs">
                      QR
                    </button>
                    <button onClick={() => hapusTamu(t)} className="ml-auto rounded-full px-2 py-1.5 text-xs text-red-500 hover:text-red-700" aria-label={`Hapus ${t.nama}`}>
                      Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modal QR */}
      {qrTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setQrTarget(null)} role="dialog" aria-modal="true">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 ui-title text-base">{qrTarget.label}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrTarget.url} alt={`QR ${qrTarget.label}`} className="mx-auto w-full max-w-[240px] rounded-lg" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => downloadDataUrl(qrTarget.url, `qr-${qrTarget.label.replace(/\W+/g, '-')}.png`)} className="ui-btn ui-btn-primary flex-1">
                Unduh PNG
              </button>
              <button onClick={() => setQrTarget(null)} className="ui-btn ui-btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

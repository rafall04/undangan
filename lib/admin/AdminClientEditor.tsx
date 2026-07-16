'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PhotoManager } from './PhotoManager';
import { StudioEditor } from '@/lib/studio/StudioEditor';
import { DeleteClientButton } from './DeleteClientButton';
import { BRAND, waLink } from '@/lib/brand';
import { normalizePhone } from '@/lib/kirim/utils';

// ============================================================================
// Editor undangan (admin): kelola status publish/paket/masa-berlaku + edit
// config.json (validasi zod di server saat simpan).
// ============================================================================

type Status = 'draft' | 'published' | 'disabled';
const STATUSES: { id: Status; label: string }[] = [
  { id: 'published', label: 'Terbit' },
  { id: 'draft', label: 'Draft' },
  { id: 'disabled', label: 'Nonaktif' },
];

function toDateInput(ms: number | null): string {
  if (!ms) return '';
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Tanggal (YYYY-MM-DD) N bulan dari hari ini — untuk auto-isi masa berlaku paket. */
function plusMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export interface PaketOption {
  id: string;
  nama: string;
  durasiBulan: number;
}

export function AdminClientEditor({
  slug,
  judul,
  initialJson,
  initialStatus,
  initialPaket,
  initialExpiresAt,
  rsvpCount,
  paketOptions,
}: {
  slug: string;
  judul: string;
  initialJson: string;
  initialStatus: Status;
  initialPaket: string | null;
  initialExpiresAt: number | null;
  rsvpCount: number;
  /** Dari Pengaturan (DB) — bukan hardcode, ikut paket yang admin atur. */
  paketOptions: PaketOption[];
}) {
  const router = useRouter();
  const [json, setJson] = useState(initialJson);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [paket, setPaket] = useState(initialPaket ?? '');
  const [expiry, setExpiry] = useState(toDateInput(initialExpiresAt));
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [magic, setMagic] = useState('');
  const [magicMsg, setMagicMsg] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [magicBusy, setMagicBusy] = useState(false);

  const parsedConfig = useMemo(() => {
    try {
      return JSON.parse(initialJson);
    } catch {
      return {};
    }
  }, [initialJson]);
  // Sinkronkan editor JSON mentah bila config server berubah (mis. sesudah simpan form).
  useEffect(() => setJson(initialJson), [initialJson]);

  // Ingat No. WA client per undangan (lokal di browser admin).
  useEffect(() => {
    try {
      const v = localStorage.getItem(`rafayana:clientwa:${slug}`);
      if (v) setClientPhone(v);
    } catch {
      /* abaikan */
    }
  }, [slug]);

  async function saveConfig() {
    setIssues([]);
    setMsg('');
    let obj: unknown;
    try {
      obj = JSON.parse(json);
    } catch (e) {
      setIssues([`JSON tidak valid: ${(e as Error).message}`]);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${slug}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(obj),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; issues?: string[]; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setIssues(j?.issues ?? [j?.error ?? 'Gagal menyimpan.']);
        return;
      }
      setMsg('Config tersimpan ✓');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function patchMeta(patch: Record<string, unknown>, okMsg: string) {
    const res = await fetch(`/api/admin/clients/${slug}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const j = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (res.ok && j?.ok) {
      setMsg(okMsg);
      router.refresh();
    } else {
      setMsg('Gagal memperbarui.');
    }
  }

  function onboardingMsg(url: string): string {
    const kirimUrl = `${BRAND.baseUrl}/u/${slug}/kirim`;
    const accessKey = (parsedConfig?.accessKey as string) ?? '';
    return `Halo, ${judul} 👋

Undangan digital Anda sudah siap! Untuk mulai menyebar undangan ke tamu, silakan masuk lewat tautan ini (langsung masuk, tanpa kata sandi):

${url}

Setelah masuk, tambahkan daftar tamu lalu kirim undangannya ke WhatsApp mereka satu per satu.

—
Cadangan bila tautan kedaluwarsa — buka: ${kirimUrl}
Kode akses: ${accessKey}

Terima kasih 🙏
${BRAND.penuh}`;
  }

  function copyText(t: string) {
    navigator.clipboard?.writeText(t);
    setMsg('Tersalin ✓');
  }

  async function genMagic() {
    setMagicBusy(true);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/clients/${slug}/magic`, { method: 'POST' });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; url?: string } | null;
      if (res.ok && j?.ok && j.url) {
        setMagic(j.url);
        setMagicMsg(onboardingMsg(j.url));
      } else setMsg('Gagal membuat link login.');
    } catch {
      setMsg('Gagal terhubung.');
    } finally {
      setMagicBusy(false);
    }
  }

  return (
    <div className="ui-container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="ui-link text-xs">
            ← Dashboard
          </Link>
          <h1 className="ui-title mt-1 text-xl">{judul}</h1>
          <p className="text-xs text-slate-500">
            /{slug} · {rsvpCount} RSVP
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/u/${slug}`} target="_blank" className="ui-btn ui-btn-secondary">
            Lihat Undangan
          </Link>
          <Link href={`/u/${slug}/kirim`} target="_blank" className="ui-btn ui-btn-secondary">
            Alat Kirim
          </Link>
          <DeleteClientButton slug={slug} />
        </div>
      </div>

      {msg && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{msg}</p>}

      {/* Status publish */}
      <section className="ui-card mt-6 p-5">
        <h2 className="ui-title text-base">Status &amp; Paket</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatus(st.id);
                patchMeta({ status: st.id }, `Status: ${st.label} ✓`);
              }}
              className={`ui-btn ${status === st.id ? 'ui-btn-primary' : 'ui-btn-secondary'}`}
            >
              {st.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="ui-label">Paket</span>
            <select
              value={paket}
              onChange={(e) => {
                const id = e.target.value;
                setPaket(id);
                // Pilih paket → masa berlaku otomatis = hari ini + durasi paket.
                const opt = paketOptions.find((p) => p.id === id);
                if (opt) setExpiry(plusMonths(opt.durasiBulan));
              }}
              className="ui-input w-auto"
            >
              <option value="">—</option>
              {paketOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} · {p.durasiBulan} bln
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="ui-label">Masa berlaku s/d</span>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="ui-input w-auto" />
          </label>
          <button
            onClick={() => patchMeta({ paket: paket || null, expiresAt: expiry ? new Date(expiry).getTime() : null }, 'Paket & masa berlaku disimpan ✓')}
            className="ui-btn ui-btn-primary"
          >
            Simpan
          </button>
        </div>

        {/* Kirim akun (magic-link) ke client via WhatsApp */}
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-800">Kirim akun ke client (via WhatsApp)</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Buat tautan masuk sekali-klik (tanpa kata sandi). Berlaku 7 hari &amp; bisa dipakai berulang — aman dari pratinjau WA. Client tinggal ketuk → langsung masuk ke alat kirim tamu.
          </p>
          <div className="mt-2">
            <button onClick={genMagic} disabled={magicBusy} className="ui-btn ui-btn-secondary">
              {magicBusy ? 'Membuat…' : magic ? 'Buat ulang tautan' : 'Buat tautan login'}
            </button>
          </div>

          {magic && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="ui-label">No. WhatsApp client (opsional)</label>
                <input
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    try {
                      localStorage.setItem(`rafayana:clientwa:${slug}`, e.target.value);
                    } catch {
                      /* abaikan */
                    }
                  }}
                  placeholder="08xxxxxxxxxx"
                  inputMode="tel"
                  className="ui-input"
                />
              </div>
              <div>
                <label className="ui-label">Pesan (bisa diedit)</label>
                <textarea
                  value={magicMsg}
                  onChange={(e) => setMagicMsg(e.target.value)}
                  className="ui-input min-h-[160px] text-xs leading-relaxed"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={waLink(magicMsg, normalizePhone(clientPhone))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.3.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .1 0 .7-.1 1.1Z" />
                  </svg>
                  Kirim ke WhatsApp
                </a>
                <button onClick={() => copyText(magic)} className="ui-btn ui-btn-secondary">
                  Salin tautan
                </button>
                <button onClick={() => copyText(magicMsg)} className="ui-btn ui-btn-secondary">
                  Salin pesan
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Nomor kosong → WhatsApp terbuka lalu Anda pilih kontak client. Isi nomor → langsung ke chat client.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Kelola foto */}
      <PhotoManager slug={slug} />

      {/* Editor form terstruktur (utama) — pakai ulang form Studio, simpan ke server */}
      <div className="mt-6">
        <h2 className="ui-title mb-2 text-base">Data Undangan</h2>
        <StudioEditor
          key={initialJson}
          mode="admin"
          slug={slug}
          initialConfig={parsedConfig}
          onSaved={() => router.refresh()}
          paketOptions={paketOptions}
        />
      </div>

      {/* Lanjutan: JSON mentah untuk field di luar form */}
      <details className="ui-card mt-6 p-5">
        <summary className="ui-title cursor-pointer text-base">Edit JSON mentah (lanjutan)</summary>
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Untuk field yang belum ada di form: galeri, cerita cinta, musik, acara ke-3, dll.
            </p>
            <button onClick={saveConfig} disabled={saving} className="ui-btn ui-btn-primary shrink-0">
              {saving ? 'Menyimpan…' : 'Simpan JSON'}
            </button>
          </div>
          {issues.length > 0 && (
            <ul className="mt-3 space-y-1 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">
              {issues.map((it, i) => (
                <li key={i}>• {it}</li>
              ))}
            </ul>
          )}
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            spellCheck={false}
            className="mt-3 min-h-[420px] w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-slate-900"
          />
        </div>
      </details>
    </div>
  );
}

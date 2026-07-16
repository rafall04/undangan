'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PhotoManager } from './PhotoManager';
import { StudioEditor } from '@/lib/studio/StudioEditor';
import { DeleteClientButton } from './DeleteClientButton';

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

export function AdminClientEditor({
  slug,
  judul,
  initialJson,
  initialStatus,
  initialPaket,
  initialExpiresAt,
  rsvpCount,
}: {
  slug: string;
  judul: string;
  initialJson: string;
  initialStatus: Status;
  initialPaket: string | null;
  initialExpiresAt: number | null;
  rsvpCount: number;
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

  async function genMagic() {
    setMagicBusy(true);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/clients/${slug}/magic`, { method: 'POST' });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; url?: string } | null;
      if (res.ok && j?.ok && j.url) setMagic(j.url);
      else setMsg('Gagal membuat link login.');
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
            <select value={paket} onChange={(e) => setPaket(e.target.value)} className="ui-input w-auto">
              <option value="">—</option>
              <option value="perak">Perak</option>
              <option value="emas">Emas</option>
              <option value="platinum">Platinum</option>
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

        {/* Magic-link login untuk client */}
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-800">Link login client (magic-link)</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Kirim ke client via WA — sekali klik langsung masuk ke alat kirim, tanpa kode akses. Berlaku 7 hari, sekali pakai.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button onClick={genMagic} disabled={magicBusy} className="ui-btn ui-btn-secondary">
              {magicBusy ? 'Membuat…' : 'Buat link login'}
            </button>
            {magic && (
              <button onClick={() => navigator.clipboard?.writeText(magic)} className="ui-btn ui-btn-secondary">
                Salin
              </button>
            )}
          </div>
          {magic && <input readOnly value={magic} onFocus={(e) => e.target.select()} className="ui-input mt-2 text-xs" />}
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

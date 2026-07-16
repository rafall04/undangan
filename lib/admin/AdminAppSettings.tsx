'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { normalizePhone } from '@/lib/kirim/utils';
// Type-only: lib/settings.ts memakai better-sqlite3 (server-only) — import type
// dihapus saat compile sehingga tidak ikut ke bundle browser.
import type { AppSettings, PaketSetting } from '@/lib/settings';

// ============================================================================
// Pengaturan aplikasi (admin): nomor WA bisnis + paket & harga.
// Tersimpan di DB → landing/katalog langsung ikut berubah (revalidate di API).
// ============================================================================

const rupiah = (n: number) => 'Rp' + Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const blankPaket = (i: number): PaketSetting => ({
  id: `paket-${i}`,
  nama: 'Paket Baru',
  hargaAngka: 0,
  durasiBulan: 10,
  ringkas: '',
  fitur: [],
});

export function AdminAppSettings({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [wa, setWa] = useState(initial.whatsapp);
  const [paket, setPaket] = useState<PaketSetting[]>(initial.paket);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [issues, setIssues] = useState<string[]>([]);

  function patch(i: number, p: Partial<PaketSetting>) {
    setPaket((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...p } : x)));
  }

  async function save() {
    setSaving(true);
    setMsg('');
    setIssues([]);
    // 08xx → 62xx agar tautan wa.me valid.
    const nomor = normalizePhone(wa) || wa.replace(/\D/g, '');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ whatsapp: nomor, paket }),
      });
      const j = (await res.json().catch(() => null)) as {
        ok?: boolean;
        issues?: string[];
        settings?: AppSettings;
      } | null;
      if (!res.ok || !j?.ok) {
        setIssues(j?.issues ?? ['Gagal menyimpan.']);
        return;
      }
      if (j.settings) {
        setWa(j.settings.whatsapp);
        setPaket(j.settings.paket);
      }
      setMsg('Pengaturan tersimpan ✓ — landing & harga langsung diperbarui.');
      router.refresh();
    } catch {
      setIssues(['Gagal terhubung.']);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ui-card mt-6 p-5">
      <h2 className="ui-title text-base">Pengaturan Umum</h2>
      <p className="mt-1 text-xs text-slate-500">
        Nomor WA &amp; daftar paket dipakai di landing dan tombol pesan. Perubahan langsung tayang — tanpa deploy ulang.
      </p>

      {msg && <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{msg}</p>}
      {issues.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">
          {issues.map((it, i) => (
            <li key={i}>• {it}</li>
          ))}
        </ul>
      )}

      {/* Nomor WA bisnis */}
      <div className="mt-4 max-w-xs">
        <label className="ui-label">Nomor WhatsApp bisnis</label>
        <input
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          placeholder="085233047094"
          inputMode="tel"
          className="ui-input"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Boleh 08xx — otomatis jadi format 62xx saat disimpan. Sekarang: <b>{normalizePhone(wa) || '—'}</b>
        </p>
      </div>

      {/* Paket & harga */}
      <div className="mt-6 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Paket &amp; Harga</h3>
        <button
          onClick={() => setPaket((p) => [...p, blankPaket(p.length + 1)])}
          className="ui-btn ui-btn-secondary"
          type="button"
        >
          + Tambah paket
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {paket.map((p, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-0 flex-1">
                <span className="ui-label">Nama paket</span>
                <input value={p.nama} onChange={(e) => patch(i, { nama: e.target.value })} className="ui-input" />
              </label>
              <label className="w-28">
                <span className="ui-label">Harga (Rp)</span>
                <input
                  type="number"
                  min={0}
                  value={p.hargaAngka}
                  onChange={(e) => patch(i, { hargaAngka: Number(e.target.value) })}
                  className="ui-input"
                />
              </label>
              <label className="w-24">
                <span className="ui-label">Durasi (bln)</span>
                <input
                  type="number"
                  min={1}
                  value={p.durasiBulan}
                  onChange={(e) => patch(i, { durasiBulan: Number(e.target.value) })}
                  className="ui-input"
                />
              </label>
              <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(p.populer)}
                  onChange={(e) => patch(i, { populer: e.target.checked })}
                  className="h-4 w-4 accent-amber-500"
                />
                Populer
              </label>
              <button
                onClick={() => setPaket((prev) => prev.filter((_, idx) => idx !== i))}
                className="ui-btn ui-btn-danger"
                type="button"
              >
                Hapus
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="ui-label">Ringkasan</span>
                <input value={p.ringkas} onChange={(e) => patch(i, { ringkas: e.target.value })} className="ui-input" />
              </label>
              <label>
                <span className="ui-label">Slug/id (untuk data)</span>
                <input value={p.id} onChange={(e) => patch(i, { id: e.target.value })} className="ui-input" />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="ui-label">Fitur — satu per baris</span>
              <textarea
                value={p.fitur.join('\n')}
                onChange={(e) => patch(i, { fitur: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                className="ui-input min-h-[120px] text-xs"
              />
            </label>

            <p className="mt-2 text-[11px] text-slate-500">
              Tampil di landing: <b>{p.nama}</b> · <b>{rupiah(p.hargaAngka)}</b> · aktif {p.durasiBulan} bulan ·{' '}
              {p.fitur.length} fitur
            </p>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="ui-btn ui-btn-primary mt-5">
        {saving ? 'Menyimpan…' : 'Simpan pengaturan'}
      </button>
    </section>
  );
}

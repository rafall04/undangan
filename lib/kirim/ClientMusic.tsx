'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Musik undangan (sisi client) — pemilik undangan mengunggah lagunya sendiri.
// Ketentuan ditegakkan di server juga (lihat /api/client/music).
// ============================================================================

export function ClientMusic({ judul, src }: { judul?: string; src?: string }) {
  const router = useRouter();
  const [nama, setNama] = useState(judul ?? '');
  const [setuju, setSetuju] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', files[0]);
      fd.append('judul', nama);
      fd.append('setuju', String(setuju));
      const res = await fetch('/api/client/music', { method: 'POST', body: fd });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? 'Gagal mengunggah.');
        return;
      }
      setMsg('Lagu tersimpan ✓ — langsung dipakai di undangan Anda.');
      router.refresh();
    } catch {
      setErr('Gagal terhubung.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function hapus() {
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const res = await fetch('/api/client/music', { method: 'DELETE' });
      if (res.ok) {
        setMsg('Lagu dihapus dari undangan.');
        router.refresh();
      } else setErr('Gagal menghapus.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ui-container max-w-3xl pt-8">
      <h2 className="ui-title text-base">Musik Undangan</h2>
      <p className="mt-1 text-sm text-slate-500">
        Ingin memakai lagu sendiri? Unggah di sini — langsung terpasang sebagai backsound undangan Anda.
      </p>

      <div className="ui-card mt-3 p-5">
        {src ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">🎵 {judul || 'Lagu undangan'}</p>
              <p className="text-[11px] text-slate-400">Sedang dipakai di undangan Anda</p>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls preload="none" src={src} className="h-8 w-56 max-w-full" />
            <button onClick={hapus} disabled={busy} className="ui-btn ui-btn-danger shrink-0">
              Hapus
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Belum ada lagu unggahan. Undangan memakai musik bawaan yang dipilih admin (bila ada).
          </p>
        )}

        <div className="mt-4 border-t border-slate-200 pt-4">
          <label className="block sm:max-w-xs">
            <span className="ui-label">Judul lagu</span>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="mis. Lagu Kenangan Kami"
              className="ui-input"
            />
          </label>

          <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
            />
            <span>
              Saya menyatakan <b>memiliki hak atau izin</b> untuk memakai lagu ini di undangan saya, dan bertanggung
              jawab atas penggunaannya.
            </span>
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label
              className={`ui-btn shrink-0 ${setuju && !busy ? 'ui-btn-primary cursor-pointer' : 'ui-btn-secondary cursor-not-allowed opacity-60'}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.wav"
                className="hidden"
                disabled={!setuju || busy}
                onChange={(e) => upload(e.target.files)}
              />
              {busy ? 'Mengunggah…' : src ? 'Ganti lagu' : 'Unggah lagu'}
            </label>
            <span className="text-[11px] text-slate-400">MP3/M4A/OGG/WAV · maks 8 MB</span>
          </div>

          {!setuju && <p className="mt-2 text-[11px] text-slate-400">Centang pernyataan di atas untuk mengunggah.</p>}
          {err && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>}
          {msg && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{msg}</p>}
        </div>
      </div>
    </section>
  );
}

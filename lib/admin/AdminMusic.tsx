'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MUSIC_LIBRARY } from '@/lib/music/library';
// Type-only: lib/settings.ts memakai better-sqlite3 (server-only).
import type { TrackSetting } from '@/lib/settings';

// ============================================================================
// Playlist musik (admin): unggah track → langsung jadi pilihan backsound di
// editor undangan (Studio & admin). File disimpan persisten di content/media/.
// ============================================================================

export function AdminMusic({ initial }: { initial: TrackSetting[] }) {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackSetting[]>(initial);
  const [judul, setJudul] = useState('');
  const [mood, setMood] = useState('');
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
      fd.append('judul', judul);
      fd.append('mood', mood);
      const res = await fetch('/api/admin/music', { method: 'POST', body: fd });
      const j = (await res.json().catch(() => null)) as {
        ok?: boolean;
        musik?: TrackSetting[];
        error?: string;
        issues?: string[];
      } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? j?.issues?.join(' · ') ?? 'Gagal mengunggah.');
        return;
      }
      if (j.musik) setTracks(j.musik);
      setJudul('');
      setMood('');
      setMsg('Lagu ditambahkan ke playlist ✓');
      router.refresh();
    } catch {
      setErr('Gagal terhubung.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/music?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; musik?: TrackSetting[] } | null;
      if (res.ok && j?.ok && j.musik) setTracks(j.musik);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ui-card mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="ui-title text-base">Playlist Musik</h2>
        <span className="text-xs text-slate-500">
          {MUSIC_LIBRARY.length} bawaan · {tracks.length} unggahan
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Lagu yang diunggah langsung muncul sebagai pilihan backsound di editor undangan. Disimpan permanen (aman dari
        redeploy). Maks 8 MB per lagu — agar undangan tetap ringan di HP tamu.
      </p>
      <p className="mt-1 text-[11px] text-amber-700">
        ⚠️ Pastikan Anda memiliki hak/lisensi atas lagu yang diunggah — file ini akan disebarkan ke semua tamu undangan.
      </p>

      {msg && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{msg}</p>}
      {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>}

      {/* Form unggah */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="sm:flex-1">
          <span className="ui-label">Judul lagu</span>
          <input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="mis. Senja di Jogja" className="ui-input" />
        </label>
        <label className="sm:w-44">
          <span className="ui-label">Nuansa (opsional)</span>
          <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Jawa · Romantis" className="ui-input" />
        </label>
        <label className="ui-btn ui-btn-primary shrink-0 cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.wav"
            className="hidden"
            onChange={(e) => upload(e.target.files)}
            disabled={busy}
          />
          {busy ? 'Mengunggah…' : '+ Unggah lagu'}
        </label>
      </div>

      {/* Daftar unggahan */}
      {tracks.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">
          Belum ada lagu unggahan. Library bawaan tetap bisa dipakai.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {tracks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{t.judul}</p>
                <p className="truncate text-[11px] text-slate-400">
                  {t.mood ? `${t.mood} · ` : ''}
                  {t.file}
                </p>
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls preload="none" src={`/media/lib/${encodeURIComponent(t.file)}`} className="h-8 w-56 max-w-full" />
              <button onClick={() => remove(t.id)} disabled={busy} className="ui-btn ui-btn-danger shrink-0">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Library bawaan (read-only) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-medium text-slate-600">
          Library bawaan ({MUSIC_LIBRARY.length}) — selalu tersedia
        </summary>
        <ul className="mt-2 space-y-1">
          {MUSIC_LIBRARY.map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-medium text-slate-700">{t.judul}</span> · {t.mood}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

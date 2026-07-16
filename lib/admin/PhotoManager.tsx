'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Kelola foto klien (admin). Alur "peran": pilih SLOT (Sampul/Pria/Wanita/
// Galeri/Cerita) lalu unggah foto apa adanya (dari galeri/WA) — server otomatis
// beri nama kanonik, optimasi (.opt.webp), dan menyambungkannya ke config.
// Titik fokus (object-position) diatur dengan mengeklik/ketuk foto.
// ============================================================================

interface Photo {
  file: string;
  size: number;
  optimized: boolean;
  url: string;
  role?: string;
  fokus?: string | null;
}

const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'gallery', label: 'Galeri (tambah foto)' },
  { value: 'cover', label: 'Sampul / cover' },
  { value: 'groom', label: 'Mempelai pria' },
  { value: 'bride', label: 'Mempelai wanita' },
  { value: 'story', label: 'Cerita (love story)' },
];

const ROLE_LABEL: Record<string, string> = {
  cover: 'Sampul',
  groom: 'Pria',
  bride: 'Wanita',
  gallery: 'Galeri',
  story: 'Cerita',
  lainnya: 'Lainnya',
};

const ROLE_BADGE: Record<string, string> = {
  cover: 'bg-amber-100 text-amber-700',
  groom: 'bg-sky-100 text-sky-700',
  bride: 'bg-pink-100 text-pink-700',
  gallery: 'bg-slate-100 text-slate-600',
  story: 'bg-violet-100 text-violet-700',
  lainnya: 'bg-red-100 text-red-700',
};

function kb(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** "50% 30%" → {x,y} untuk posisi marker. Default center. */
function parseFokus(f?: string | null): { x: number; y: number } {
  const m = (f ?? '').match(/(\d{1,3})%\s+(\d{1,3})%/);
  return m ? { x: clamp(+m[1], 0, 100), y: clamp(+m[2], 0, 100) } : { x: 50, y: 50 };
}

export function PhotoManager({ slug }: { slug: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [role, setRole] = useState('gallery');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const base = `/api/admin/clients/${slug}/photos`;

  const load = useCallback(async () => {
    try {
      const res = await fetch(base, { cache: 'no-store' });
      const j = (await res.json()) as { ok?: boolean; photos?: Photo[] };
      if (res.ok && j.ok && Array.isArray(j.photos)) setPhotos(j.photos);
    } catch {
      /* abaikan */
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('role', role);
      Array.from(files).forEach((f) => fd.append('files', f));
      const res = await fetch(base, { method: 'POST', body: fd });
      const j = (await res.json()) as { ok?: boolean; photos?: Photo[]; errors?: string[] };
      if (Array.isArray(j.photos)) setPhotos(j.photos);
      if (j.errors?.length) setErr(j.errors.join(' · '));
    } catch {
      setErr('Upload gagal. Coba lagi.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove(file: string) {
    setBusy(true);
    try {
      const res = await fetch(`${base}?file=${encodeURIComponent(file)}`, { method: 'DELETE' });
      const j = (await res.json()) as { ok?: boolean; photos?: Photo[] };
      if (res.ok && Array.isArray(j.photos)) setPhotos(j.photos);
    } finally {
      setBusy(false);
    }
  }

  /** Klik/ketuk foto → hitung titik fokus (object-position) → simpan. */
  async function setFokus(file: string, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp(Math.round(((e.clientX - rect.left) / rect.width) * 100), 0, 100);
    const y = clamp(Math.round(((e.clientY - rect.top) / rect.height) * 100), 0, 100);
    const fokus = `${x}% ${y}%`;
    setPhotos((prev) => prev.map((p) => (p.file === file ? { ...p, fokus } : p))); // optimistik
    try {
      await fetch(base, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ file, fokus }),
      });
    } catch {
      /* abaikan; reload berikutnya menyinkronkan */
    }
  }

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label ?? 'Galeri';

  return (
    <section className="ui-card mt-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="ui-title text-base">Foto</h2>
        <span className="text-xs text-slate-500">{photos.length} file</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Pilih <b>peran</b> lalu unggah foto apa adanya (dari galeri/WA). Nama file &amp; sambungan ke undangan diatur{' '}
        <b>otomatis</b> — tak perlu ganti nama. Optimasi otomatis (≤1600px, webp).
      </p>

      {/* Pemilih peran + dropzone */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="sm:w-52">
          <span className="ui-label">Unggah sebagai</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="ui-input" disabled={busy}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            upload(e.dataTransfer.files);
          }}
          className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-slate-900"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            multiple={role === 'gallery' || role === 'story'}
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <span className="text-sm text-slate-700">
            {busy ? 'Mengunggah…' : `Ketuk untuk pilih foto → ${roleLabel}`}
          </span>
          <span className="mt-0.5 text-[11px] text-slate-400">JPG / PNG / WEBP · maks 10 MB</span>
        </label>
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      {/* Grid foto */}
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Memuat…</p>
      ) : photos.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">
          Belum ada foto. Slot yang kosong otomatis memakai placeholder monogram.
        </p>
      ) : (
        <>
          <p className="mt-4 text-[11px] text-slate-500">
            💡 Klik/ketuk pada foto untuk mengatur <b>titik fokus</b> (bagian yang selalu tampil saat foto dipotong).
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => {
              const pos = parseFokus(p.fokus);
              return (
                <li key={p.file} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div
                    onClick={(e) => setFokus(p.file, e)}
                    className="relative aspect-[4/3] w-full cursor-crosshair bg-black/5"
                    title="Klik untuk atur titik fokus"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.file}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: p.fokus ?? '50% 50%' }}
                      loading="lazy"
                      draggable={false}
                    />
                    {/* Marker titik fokus */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.5)]"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    />
                    {p.role && p.role !== 'lainnya' && (
                      <span
                        className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[p.role] ?? ROLE_BADGE.lainnya}`}
                      >
                        {ROLE_LABEL[p.role] ?? p.role}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-slate-700">{p.file}</p>
                      <p className="text-[10px] text-slate-400">
                        {kb(p.size)}
                        {p.optimized && <span className="ml-1 text-emerald-600">· opt ✓</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(p.file)}
                      disabled={busy}
                      className="shrink-0 rounded-full px-2 py-1 text-[11px] text-red-500 hover:text-red-700 disabled:opacity-60"
                      aria-label={`Hapus ${p.file}`}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

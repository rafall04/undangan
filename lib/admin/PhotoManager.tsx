'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Kelola foto klien (admin) — upload (auto .opt.webp), pratinjau, hapus.
// ============================================================================

interface Photo {
  file: string;
  size: number;
  optimized: boolean;
  url: string;
}

const SLOT_HINTS = 'cover.jpg · groom.jpg · bride.jpg · gallery-01.jpg… · story-01.jpg…';

function kb(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export function PhotoManager({ slug }: { slug: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
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

  return (
    <section className="mt-6 rounded-2xl border border-brand-line bg-brand-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-brand-serif text-lg font-semibold text-brand-ink">Foto</h2>
        <span className="text-xs text-brand-muted">{photos.length} file</span>
      </div>
      <p className="mt-1 text-[11px] text-brand-muted">
        Nama file harus cocok dengan config: <code>{SLOT_HINTS}</code>. Upload otomatis dioptimasi (≤1600px, webp).
      </p>

      {/* Dropzone / picker */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-line bg-brand-cream/40 py-6 text-center hover:border-brand-gold"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <span className="text-sm text-brand-ink">{busy ? 'Mengunggah…' : 'Seret foto ke sini atau klik untuk pilih'}</span>
        <span className="mt-0.5 text-[11px] text-brand-muted">JPG / PNG / WEBP / SVG · maks 10 MB</span>
      </label>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      {/* Grid foto */}
      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Memuat…</p>
      ) : photos.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-brand-line py-6 text-center text-sm text-brand-muted">
          Belum ada foto. Foto yang belum diunggah otomatis memakai placeholder monogram.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <li key={p.file} className="overflow-hidden rounded-xl border border-brand-line bg-brand-cream">
              <div className="aspect-[4/3] w-full bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.file} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-brand-ink">{p.file}</p>
                  <p className="text-[10px] text-brand-muted">
                    {kb(p.size)}
                    {p.optimized && <span className="ml-1 text-green-700">· opt ✓</span>}
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
          ))}
        </ul>
      )}
    </section>
  );
}

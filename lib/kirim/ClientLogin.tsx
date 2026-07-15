'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Gerbang login client (pemilik undangan) — verifikasi kode akses di SERVER
// (/api/client/login) lalu set cookie sesi. Ganti gate lama sisi-browser.
// ============================================================================

export function ClientLogin({ slug, judul }: { slug: string; judul: string }) {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || busy) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, accessKey: key }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? 'Gagal masuk.');
        setBusy(false);
        return;
      }
      // Cookie sesi sudah di-set server → server re-render menampilkan alat.
      router.refresh();
    } catch {
      setErr('Gagal terhubung. Coba lagi.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 text-center">
      <p className="font-brand-script text-3xl text-brand-gold">Alat Kirim</p>
      <h1 className="mt-1 font-brand-serif text-2xl font-semibold text-brand-ink">{judul}</h1>
      <p className="mt-3 text-sm text-brand-muted">
        Halaman ini khusus pemilik undangan. Masukkan kode akses.
      </p>
      <form onSubmit={submit}>
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setErr('');
          }}
          placeholder="Kode akses"
          autoFocus
          className="mt-5 w-full rounded-xl border border-brand-line bg-brand-paper px-4 py-2.5 text-center text-sm outline-none focus:border-brand-gold"
        />
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-full bg-brand-ink py-2.5 text-sm font-medium text-brand-cream hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}

export function ClientLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/client/logout', { method: 'POST' });
    } catch {
      /* abaikan */
    }
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      disabled={busy}
      className="rounded-full border border-brand-line px-4 py-1.5 text-sm text-brand-ink hover:border-brand-gold disabled:opacity-60"
    >
      Keluar
    </button>
  );
}

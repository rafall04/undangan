'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Gerbang login client (pemilik undangan) — verifikasi kode akses di SERVER
// (/api/client/login) lalu set cookie sesi. UI "app" netral.
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
      router.refresh();
    } catch {
      setErr('Gagal terhubung. Coba lagi.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Alat Kirim Undangan</h1>
        <p className="mt-1 text-sm text-slate-500">{judul}</p>
        <p className="mt-3 text-sm text-slate-500">Halaman ini khusus pemilik undangan. Masukkan kode akses.</p>
      </div>
      <form onSubmit={submit} className="ui-card space-y-3 p-6">
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setErr('');
          }}
          placeholder="Kode akses"
          autoFocus
          className="ui-input text-center"
        />
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>}
        <button type="submit" disabled={busy} className="ui-btn ui-btn-primary w-full">
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
    <button onClick={logout} disabled={busy} className="ui-btn ui-btn-secondary">
      Keluar
    </button>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Login admin (client) — email + password → /api/admin/login → cookie sesi.
// UI "app" netral (bukan mood undangan).
// ============================================================================

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? 'Gagal masuk.');
        setBusy(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setErr('Gagal terhubung. Coba lagi.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">R</span>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Rafayana Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk untuk mengelola undangan &amp; pesanan.</p>
      </div>
      <form onSubmit={submit} className="ui-card space-y-4 p-6">
        <label className="block">
          <span className="ui-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr('');
            }}
            autoFocus
            className="ui-input"
            placeholder="admin@rafayana.local"
          />
        </label>
        <label className="block">
          <span className="ui-label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErr('');
            }}
            className="ui-input"
            placeholder="••••••••"
          />
        </label>
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>}
        <button type="submit" disabled={busy} className="ui-btn ui-btn-primary w-full">
          {busy ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      /* abaikan */
    }
    router.replace('/admin/login');
    router.refresh();
  }
  return (
    <button onClick={logout} disabled={busy} className="ui-btn ui-btn-secondary whitespace-nowrap">
      Keluar
    </button>
  );
}

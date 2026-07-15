'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Login admin (client) — email + password → /api/admin/login → cookie sesi.
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

  const input =
    'mt-1 w-full rounded-xl border border-brand-line bg-brand-paper px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-gold';

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="text-center">
        <p className="font-brand-script text-3xl text-brand-gold">Rafayana</p>
        <h1 className="mt-1 font-brand-serif text-2xl font-semibold text-brand-ink">Panel Admin</h1>
        <p className="mt-2 text-sm text-brand-muted">Masuk untuk mengelola undangan &amp; pesanan.</p>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-3 text-left">
        <label className="block text-sm">
          <span className="text-brand-muted">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr('');
            }}
            autoFocus
            className={input}
            placeholder="admin@rafayana.local"
          />
        </label>
        <label className="block text-sm">
          <span className="text-brand-muted">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErr('');
            }}
            className={input}
            placeholder="••••••••"
          />
        </label>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-brand-ink py-2.5 text-sm font-medium text-brand-cream hover:opacity-90 disabled:opacity-60"
        >
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
    <button
      onClick={logout}
      disabled={busy}
      className="rounded-full border border-brand-line px-4 py-1.5 text-sm text-brand-ink hover:border-brand-gold disabled:opacity-60"
    >
      Keluar
    </button>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function AdminSettings({ email }: { email: string }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setErr('');
    if (next.length < 8) return setErr('Password baru minimal 8 karakter.');
    if (next !== confirm) return setErr('Konfirmasi password tidak cocok.');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? 'Gagal mengganti password.');
      } else {
        setMsg('Password berhasil diganti ✓');
        setCur('');
        setNext('');
        setConfirm('');
      }
    } catch {
      setErr('Gagal terhubung.');
    } finally {
      setBusy(false);
    }
  }

  const input =
    'mt-1 w-full rounded-xl border border-brand-line bg-brand-paper px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-gold';

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Link href="/admin" className="text-xs text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-2 font-brand-serif text-2xl font-semibold text-brand-ink">Pengaturan</h1>
      <p className="text-xs text-brand-muted">Akun admin: {email}</p>

      <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border border-brand-line bg-brand-paper p-5">
        <h2 className="font-brand-serif text-lg font-semibold text-brand-ink">Ganti Password</h2>
        <label className="block text-sm">
          <span className="text-brand-muted">Password lama</span>
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className={input} autoComplete="current-password" />
        </label>
        <label className="block text-sm">
          <span className="text-brand-muted">Password baru (min 8)</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className={input} autoComplete="new-password" />
        </label>
        <label className="block text-sm">
          <span className="text-brand-muted">Konfirmasi password baru</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} autoComplete="new-password" />
        </label>
        {msg && <p className="rounded-lg bg-green-600/10 px-3 py-2 text-xs text-green-800">{msg}</p>}
        {err && <p className="rounded-lg bg-red-600/10 px-3 py-2 text-xs text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-brand-ink py-2.5 text-sm font-medium text-brand-cream hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Menyimpan…' : 'Ganti Password'}
        </button>
      </form>
    </div>
  );
}

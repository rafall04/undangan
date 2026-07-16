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

  return (
    <div className="ui-container max-w-md py-8">
      <Link href="/admin" className="ui-link text-xs">
        ← Dashboard
      </Link>
      <h1 className="ui-title mt-2 text-xl">Pengaturan</h1>
      <p className="text-xs text-slate-500">Akun admin: {email}</p>

      <form onSubmit={submit} className="ui-card mt-6 space-y-4 p-6">
        <h2 className="ui-title">Ganti Password</h2>
        <label className="block">
          <span className="ui-label">Password lama</span>
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className="ui-input" autoComplete="current-password" />
        </label>
        <label className="block">
          <span className="ui-label">Password baru (min 8)</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="ui-input" autoComplete="new-password" />
        </label>
        <label className="block">
          <span className="ui-label">Konfirmasi password baru</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="ui-input" autoComplete="new-password" />
        </label>
        {msg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{msg}</p>}
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>}
        <button type="submit" disabled={busy} className="ui-btn ui-btn-primary w-full">
          {busy ? 'Menyimpan…' : 'Ganti Password'}
        </button>
      </form>
    </div>
  );
}

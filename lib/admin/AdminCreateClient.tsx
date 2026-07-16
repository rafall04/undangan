'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AdminCreateClient() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const clean = slug.trim().toLowerCase();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!clean || busy) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: clean }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; slug?: string; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? 'Gagal membuat undangan.');
        setBusy(false);
        return;
      }
      router.push(`/admin/clients/${j.slug}`);
    } catch {
      setErr('Gagal terhubung.');
      setBusy(false);
    }
  }

  return (
    <div className="ui-container max-w-lg py-10">
      <Link href="/admin" className="ui-link text-xs">
        ← Dashboard
      </Link>
      <h1 className="ui-title mt-2 text-xl">Undangan Baru</h1>
      <p className="mt-2 text-sm text-slate-500">
        Tentukan slug (URL). Undangan dibuat dari template &amp; bisa langsung diedit. Slug jadi alamat{' '}
        <code className="rounded bg-slate-100 px-1 text-slate-700">/u/&lt;slug&gt;</code>.
      </p>
      <form onSubmit={submit} className="ui-card mt-5 space-y-1 p-6">
        <label className="block">
          <span className="ui-label">Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setErr('');
            }}
            autoFocus
            placeholder="mis. andi-nia"
            className="ui-input"
          />
        </label>
        {clean && <p className="text-xs text-slate-500">URL: /u/{clean}</p>}
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="pt-3">
          <button type="submit" disabled={busy || !clean} className="ui-btn ui-btn-primary">
            {busy ? 'Membuat…' : 'Buat & Edit'}
          </button>
        </div>
      </form>
    </div>
  );
}

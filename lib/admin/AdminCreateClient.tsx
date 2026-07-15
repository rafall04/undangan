'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================================================
// Buat undangan baru (admin): slug → scaffold config template → ke editor.
// ============================================================================

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
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-xs text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-2 font-brand-serif text-2xl font-semibold text-brand-ink">Undangan Baru</h1>
      <p className="mt-2 text-sm text-brand-muted">
        Tentukan slug (URL). Undangan dibuat dari template &amp; bisa langsung diedit. Slug jadi alamat{' '}
        <code>/u/&lt;slug&gt;</code>.
      </p>
      <form onSubmit={submit} className="mt-5">
        <label className="block text-sm">
          <span className="text-brand-muted">Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setErr('');
            }}
            autoFocus
            placeholder="mis. andi-nia"
            className="mt-1 w-full rounded-xl border border-brand-line bg-brand-paper px-4 py-2.5 text-sm outline-none focus:border-brand-gold"
          />
        </label>
        {clean && <p className="mt-1 text-xs text-brand-muted">URL: /u/{clean}</p>}
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={busy || !clean}
          className="mt-4 rounded-full bg-brand-ink px-6 py-2.5 text-sm font-medium text-brand-cream hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Membuat…' : 'Buat & Edit'}
        </button>
      </form>
    </div>
  );
}

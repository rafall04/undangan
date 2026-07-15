'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Tombol "Proses" pada order Studio → buat undangan dari config order lalu ke
// editor. Admin diminta slug (URL); disarankan dari nama pasangan.
// ============================================================================

export function ProcessOrderButton({ orderId, suggestedSlug }: { orderId: number; suggestedSlug?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function process() {
    const input = window.prompt(
      'Slug URL untuk undangan ini (huruf kecil, angka, tanda hubung):',
      suggestedSlug || '',
    );
    const slug = input?.trim().toLowerCase();
    if (!slug) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/process`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; slug?: string; error?: string } | null;
      if (res.ok && j?.ok && j.slug) {
        router.push(`/admin/clients/${j.slug}`);
      } else {
        alert(j?.error ?? 'Gagal memproses order.');
        setBusy(false);
      }
    } catch {
      alert('Gagal terhubung.');
      setBusy(false);
    }
  }

  return (
    <button
      onClick={process}
      disabled={busy}
      className="rounded-full bg-brand-gold px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
    >
      {busy ? 'Memproses…' : 'Proses → Undangan'}
    </button>
  );
}

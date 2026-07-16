'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProcessOrderButton } from './ProcessOrderButton';
import type { OrderRow } from './queries';

export function OrderActions({ order }: { order: OrderRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: 'selesai' | 'batal') {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
      else {
        alert('Gagal memperbarui status.');
        setBusy(false);
      }
    } catch {
      alert('Gagal terhubung.');
      setBusy(false);
    }
  }

  const done = order.status === 'selesai' || order.status === 'batal';

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
      {order.status === 'baru' && <ProcessOrderButton orderId={order.id} suggestedSlug={order.suggestedSlug} />}
      {order.slug && (
        <Link href={`/admin/clients/${order.slug}`} className="text-brand-gold hover:underline">
          Buka
        </Link>
      )}
      {!done && (
        <>
          <button onClick={() => setStatus('selesai')} disabled={busy} className="text-green-700 hover:underline disabled:opacity-60">
            Selesai
          </button>
          <button onClick={() => setStatus('batal')} disabled={busy} className="text-red-600 hover:underline disabled:opacity-60">
            Batal
          </button>
        </>
      )}
    </div>
  );
}

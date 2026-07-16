'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteClientButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!window.confirm(`Hapus undangan "${slug}" beserta SEMUA RSVP, tamu, dan filenya? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/clients/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        alert('Gagal menghapus.');
        setBusy(false);
      }
    } catch {
      alert('Gagal terhubung.');
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="ui-btn ui-btn-danger"
    >
      {busy ? 'Menghapus…' : 'Hapus undangan'}
    </button>
  );
}

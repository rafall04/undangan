import type { Ucapan } from './types';

// ============================================================================
// FASE 2 — WishesProvider.
// Antarmuka penyedia ucapan/RSVP agar kelak MUDAH diganti backend nyata
// (mis. Supabase/Google Sheet/API) tanpa mengubah komponen UI.
// Versi ini in-memory: menyimpan di state React + diseed contoh statis.
// ============================================================================

export interface WishesProvider {
  /** Ambil daftar ucapan (terbaru dulu). */
  list(): Promise<Ucapan[]>;
  /** Kirim ucapan baru; kembalikan daftar terbaru. */
  submit(u: Ucapan): Promise<Ucapan[]>;
}

/**
 * Implementasi in-memory. Tiap instance undangan membuat satu provider yang
 * diseed dengan contoh ucapan. State disimpan di dalam objek (bukan
 * localStorage — halaman tamu dilarang pakai localStorage).
 */
export function createInMemoryWishesProvider(seed: Ucapan[] = []): WishesProvider {
  let data: Ucapan[] = [...seed];
  return {
    async list() {
      return [...data];
    },
    async submit(u) {
      data = [{ ...u, waktu: u.waktu ?? 'Baru saja' }, ...data];
      return [...data];
    },
  };
}

/**
 * Implementasi HTTP → /api/rsvp (persisten di SQLite). Dipakai pada undangan
 * klien nyata (butuh `slug`). `seed` dipakai sebagai fallback bila jaringan
 * gagal atau belum ada ucapan nyata.
 */
export function createHttpWishesProvider(slug: string, seed: Ucapan[] = []): WishesProvider {
  return {
    async list() {
      try {
        const res = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (!res.ok) return [...seed];
        const j = (await res.json()) as { wishes?: Ucapan[] };
        return Array.isArray(j.wishes) ? j.wishes : [...seed];
      } catch {
        return [...seed];
      }
    },
    async submit(u) {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, nama: u.nama, kehadiran: u.kehadiran, pesan: u.pesan }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; wishes?: Ucapan[]; error?: string } | null;
      if (!res.ok || !j?.ok) throw new Error(j?.error ?? 'Gagal mengirim ucapan.');
      return Array.isArray(j.wishes) ? j.wishes : [];
    },
  };
}

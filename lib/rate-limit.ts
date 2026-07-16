import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

// ============================================================================
// Rate-limit sederhana per-proses (in-memory). Cukup untuk setup kita: 1
// container. State hilang saat restart — itu dapat diterima karena restart
// bukan sesuatu yang bisa dipicu penyerang.
//
// Dua pola pemakaian:
//  • LOGIN  → isLimited() (cek saja) + recordFailure() saat gagal +
//    clearLimit() saat berhasil. Login yang BERHASIL tidak memakan jatah.
//  • KIRIMAN (mis. RSVP) → hitLimit(): catat & cek sekaligus.
// Singleton via globalThis agar aman terhadap HMR.
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var __rlBuckets: Map<string, number[]> | undefined;
}

const buckets = (): Map<string, number[]> => (globalThis.__rlBuckets ??= new Map());

/** Hash IP pemanggil (jangan simpan IP mentah). Sadar proxy/Cloudflare. */
export function clientIpHash(req: NextRequest): string {
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

/** Buang entri kedaluwarsa; kembalikan yang masih dalam jendela. */
function recent(key: string, windowMs: number): number[] {
  const now = Date.now();
  const arr = (buckets().get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length) buckets().set(key, arr);
  else buckets().delete(key);
  return arr;
}

/** Cegah Map tumbuh tanpa batas bila banyak IP unik. */
function sweep(windowMs: number): void {
  const b = buckets();
  if (b.size < 500) return;
  const now = Date.now();
  const stale: string[] = [];
  b.forEach((v, k) => {
    if (!v.some((t) => now - t < windowMs)) stale.push(k);
  });
  stale.forEach((k) => b.delete(k));
}

/** Sudah melewati batas? (tidak mencatat apa pun) */
export function isLimited(key: string, limit: number, windowMs: number): boolean {
  return recent(key, windowMs).length >= limit;
}

/** Catat satu kegagalan. */
export function recordFailure(key: string, windowMs: number): void {
  sweep(windowMs);
  const arr = recent(key, windowMs);
  arr.push(Date.now());
  buckets().set(key, arr);
}

/** Reset (dipanggil setelah berhasil) — agar pengguna sah tak pernah terkunci. */
export function clearLimit(key: string): void {
  buckets().delete(key);
}

/** Perkiraan detik sampai boleh mencoba lagi. */
export function retryAfterSec(key: string, windowMs: number): number {
  const arr = recent(key, windowMs);
  if (!arr.length) return 0;
  return Math.max(1, Math.ceil((windowMs - (Date.now() - arr[0])) / 1000));
}

/** Catat + cek sekaligus (untuk endpoint kiriman publik). true = dibatasi. */
export function hitLimit(key: string, limit: number, windowMs: number): boolean {
  sweep(windowMs);
  const arr = recent(key, windowMs);
  arr.push(Date.now());
  buckets().set(key, arr);
  return arr.length > limit;
}

/** Preset login: 5 kegagalan / 10 menit per IP. */
export const LOGIN_LIMIT = 5;
export const LOGIN_WINDOW_MS = 10 * 60_000;

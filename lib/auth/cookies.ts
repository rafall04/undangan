import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { CONFIG } from '@/lib/config';
import { COOKIE, readSession, sessionMaxAgeSec, type SessionKind, type Session } from './session';

// ============================================================================
// Jembatan sesi ↔ cookie httpOnly (dipakai di server component & route handler).
// Middleware TIDAK dipakai untuk validasi (Edge runtime tak bisa SQLite native);
// setiap halaman/route terproteksi memanggil currentSession() sendiri.
// ============================================================================

function baseCookie(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: CONFIG.isProd,
    path: '/',
    maxAge,
  };
}

/** Baca sesi aktif dari cookie request. */
export function currentSession(kind: SessionKind): Session | null {
  const token = cookies().get(COOKIE[kind])?.value;
  return readSession(kind, token);
}

/** Ambil token mentah dari cookie (untuk logout/destroy). */
export function currentToken(kind: SessionKind): string | undefined {
  return cookies().get(COOKIE[kind])?.value;
}

export function setSessionCookie(res: NextResponse, kind: SessionKind, token: string): void {
  res.cookies.set(COOKIE[kind], token, baseCookie(sessionMaxAgeSec()));
}

export function clearSessionCookie(res: NextResponse, kind: SessionKind): void {
  res.cookies.set(COOKIE[kind], '', baseCookie(0));
}

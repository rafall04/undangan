import type { NextRequest } from 'next/server';
import { CONFIG } from '@/lib/config';
import { BRAND } from '@/lib/brand';

// ============================================================================
// Base URL publik untuk tautan absolut (magic-link, redirect). Penting di balik
// Cloudflare Tunnel: origin request yang dilihat container bisa localhost/internal.
// Prioritas: APP_URL (env) → origin request bila jelas publik → BRAND.baseUrl.
// ============================================================================

export function publicBaseUrl(req?: NextRequest): string {
  if (CONFIG.appUrl) return CONFIG.appUrl.replace(/\/+$/, '');
  const origin = req?.nextUrl.origin ?? '';
  if (origin && !/localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0/.test(origin)) return origin;
  return BRAND.baseUrl;
}

import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { NextResponse } from 'next/server';
import { musicFilePath, MIME } from '@/lib/music/store';

// ============================================================================
// Menyajikan musik yang DIUNGGAH admin dari content/media/<file>.
// (content/ tidak ada di /public — sengaja, agar file selamat dari redeploy —
// jadi dilayani lewat route handler ini. Library bawaan tetap dari /public.)
// ============================================================================

export const runtime = 'nodejs';

export function GET(_req: Request, { params }: { params: { file: string } }) {
  const path = musicFilePath(decodeURIComponent(params.file));
  if (!path) return new NextResponse('Not found', { status: 404 });

  const type = MIME[extname(path).toLowerCase()] ?? 'application/octet-stream';
  const buf = readFileSync(path);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': type,
      // Nama file unik saat unggah → aman di-cache lama.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

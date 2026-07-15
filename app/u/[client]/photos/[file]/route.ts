import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { NextResponse } from 'next/server';
import { safePhotoPath } from '@/lib/clients/load';

// ============================================================================
// Menyajikan foto klien dari content/clients/<slug>/photos/<file>.
// (content/ tidak ada di /public, jadi dilayani lewat route handler ini.)
// ============================================================================

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

export function GET(
  _req: Request,
  { params }: { params: { client: string; file: string } },
) {
  const file = decodeURIComponent(params.file);
  const path = safePhotoPath(params.client, file);
  if (!path) {
    return new NextResponse('Not found', { status: 404 });
  }
  const type = MIME[extname(path).toLowerCase()] ?? 'application/octet-stream';
  const buf = readFileSync(path);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { currentSession } from '@/lib/auth/cookies';
import { slugExists } from '@/lib/clients/write';
import { listPhotos, savePhoto, deletePhoto } from '@/lib/clients/photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB / file

function guard(slug: string): NextResponse | null {
  if (!currentSession('admin')) return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  if (!slugExists(slug)) return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const g = guard(params.slug);
  if (g) return g;
  return NextResponse.json({ ok: true, photos: listPhotos(params.slug) });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const g = guard(params.slug);
  if (g) return g;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Upload tidak valid.' }, { status: 400 });
  }
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ ok: false, error: 'Tidak ada file.' }, { status: 400 });

  const errors: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: melebihi 10 MB`);
      continue;
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const r = await savePhoto(params.slug, file.name, buf);
    if (!r.ok) errors.push(`${file.name}: ${r.error}`);
  }

  return NextResponse.json({ ok: errors.length === 0, photos: listPhotos(params.slug), errors });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const g = guard(params.slug);
  if (g) return g;
  const file = req.nextUrl.searchParams.get('file') ?? '';
  if (!file) return NextResponse.json({ ok: false, error: 'file wajib.' }, { status: 400 });
  deletePhoto(params.slug, file);
  return NextResponse.json({ ok: true, photos: listPhotos(params.slug) });
}

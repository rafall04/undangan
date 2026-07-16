import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentSession } from '@/lib/auth/cookies';
import { slugExists } from '@/lib/clients/write';
import { listPhotos, deletePhoto, savePhotoForRole, roleOfFile, PHOTO_ROLES, type PhotoRole } from '@/lib/clients/photos';
import { wirePhotoToConfig, setPhotoFokus, getFokusMap } from '@/lib/clients/photo-slots';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB / file
const SINGLE_ROLES: PhotoRole[] = ['cover', 'groom', 'bride'];
const FOKUS_RE = /^\d{1,3}% \d{1,3}%$/;

function guard(slug: string): NextResponse | null {
  if (!currentSession('admin')) return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  if (!slugExists(slug)) return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  return null;
}

/** Daftar foto + peran (badge) + titik fokus (dari config) untuk UI. */
function enriched(slug: string) {
  const fokus = getFokusMap(slug);
  return listPhotos(slug).map((p) => ({ ...p, role: roleOfFile(p.file), fokus: fokus[p.file] ?? null }));
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const g = guard(params.slug);
  if (g) return g;
  return NextResponse.json({ ok: true, photos: enriched(params.slug) });
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

  const roleRaw = String(form.get('role') ?? 'gallery');
  const role: PhotoRole = (PHOTO_ROLES as string[]).includes(roleRaw) ? (roleRaw as PhotoRole) : 'gallery';

  const errors: string[] = [];
  // Slot tunggal (sampul/pria/wanita) hanya 1 foto; sisanya dilewati.
  const isSingle = SINGLE_ROLES.includes(role);
  const toProcess = isSingle ? files.slice(0, 1) : files;
  if (isSingle && files.length > 1) errors.push(`Slot ini hanya 1 foto; ${files.length - 1} lainnya dilewati.`);

  for (const file of toProcess) {
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: melebihi 10 MB`);
      continue;
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const r = await savePhotoForRole(params.slug, role, file.name, buf);
    if (!r.ok) {
      errors.push(`${file.name}: ${r.error}`);
      continue;
    }
    wirePhotoToConfig(params.slug, role, r.file);
  }

  revalidatePath(`/u/${params.slug}`);
  return NextResponse.json({ ok: errors.length === 0, photos: enriched(params.slug), errors });
}

// Set titik fokus (object-position) sebuah foto.
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const g = guard(params.slug);
  if (g) return g;

  const body = (await req.json().catch(() => null)) as { file?: unknown; fokus?: unknown } | null;
  const file = typeof body?.file === 'string' ? body.file : '';
  const fokus = typeof body?.fokus === 'string' ? body.fokus : '';
  if (!file || !FOKUS_RE.test(fokus)) {
    return NextResponse.json({ ok: false, error: 'Data fokus tidak valid.' }, { status: 400 });
  }
  setPhotoFokus(params.slug, file, fokus);
  revalidatePath(`/u/${params.slug}`);
  return NextResponse.json({ ok: true, photos: enriched(params.slug) });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const g = guard(params.slug);
  if (g) return g;
  const file = req.nextUrl.searchParams.get('file') ?? '';
  if (!file) return NextResponse.json({ ok: false, error: 'file wajib.' }, { status: 400 });
  deletePhoto(params.slug, file);
  revalidatePath(`/u/${params.slug}`);
  return NextResponse.json({ ok: true, photos: enriched(params.slug) });
}

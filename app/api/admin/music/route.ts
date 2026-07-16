import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { basename, extname } from 'node:path';
import { currentSession } from '@/lib/auth/cookies';
import { getSettings, saveSettings } from '@/lib/settings';
import { saveMusicFile, deleteMusicFile, MAX_AUDIO_BYTES } from '@/lib/music/store';

// ============================================================================
// Playlist musik (admin): unggah track → masuk pilihan backsound di editor.
// File disimpan di content/media/ (persisten), metadata di app_settings.
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
}

export async function GET() {
  if (!currentSession('admin')) return unauthorized();
  return NextResponse.json({ ok: true, musik: getSettings().musik });
}

export async function POST(req: NextRequest) {
  if (!currentSession('admin')) return unauthorized();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Upload tidak valid.' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'File wajib.' }, { status: 400 });
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ ok: false, error: 'Ukuran melebihi 8 MB.' }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const saved = saveMusicFile(file.name, buf);
  if (!saved.ok) return NextResponse.json({ ok: false, error: saved.error }, { status: 400 });

  const ext = extname(saved.file);
  const id = basename(saved.file, ext);
  const judul = String(form.get('judul') ?? '').trim() || id.replace(/[-_]+/g, ' ');
  const mood = String(form.get('mood') ?? '').trim();

  const cur = getSettings();
  const r = saveSettings({ ...cur, musik: [...cur.musik, { id, judul, mood, file: saved.file }] });
  if (!r.ok) {
    deleteMusicFile(saved.file); // rollback agar tak ada file yatim
    return NextResponse.json({ ok: false, issues: r.issues }, { status: 400 });
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, musik: r.settings!.musik });
}

export async function DELETE(req: NextRequest) {
  if (!currentSession('admin')) return unauthorized();
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!id) return NextResponse.json({ ok: false, error: 'id wajib.' }, { status: 400 });

  const cur = getSettings();
  const track = cur.musik.find((t) => t.id === id);
  if (!track) return NextResponse.json({ ok: false, error: 'Track tidak ditemukan.' }, { status: 404 });

  deleteMusicFile(track.file);
  const r = saveSettings({ ...cur, musik: cur.musik.filter((t) => t.id !== id) });
  if (!r.ok) return NextResponse.json({ ok: false, issues: r.issues }, { status: 400 });

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, musik: r.settings!.musik });
}

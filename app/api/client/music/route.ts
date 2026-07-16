import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentSession } from '@/lib/auth/cookies';
import { saveClientAudio, deleteClientAudio } from '@/lib/clients/photos';
import { setClientMusicConfig, clearClientMusicConfig } from '@/lib/clients/photo-slots';
import { MAX_AUDIO_BYTES } from '@/lib/music/store';

// ============================================================================
// Client mengunggah lagu SENDIRI untuk undangannya.
//
// Ketentuan (ditegakkan di server, bukan sekadar UI):
//  • harus login sebagai pemilik undangan (slug diambil dari SESI, bukan body —
//    supaya client tak bisa menulis ke undangan orang lain),
//  • wajib menyatakan memiliki hak/izin atas lagu (field `setuju`),
//  • hanya format audio, maks 8 MB (agar undangan tetap ringan di HP tamu).
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const s = currentSession('client');
  if (!s) return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  const slug = s.subject; // dari sesi — tidak bisa dipalsukan lewat body

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Upload tidak valid.' }, { status: 400 });
  }

  if (String(form.get('setuju') ?? '') !== 'true') {
    return NextResponse.json(
      { ok: false, error: 'Anda harus menyatakan memiliki hak/izin atas lagu ini.' },
      { status: 400 },
    );
  }

  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'File wajib.' }, { status: 400 });
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ ok: false, error: 'Ukuran melebihi 8 MB.' }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const saved = saveClientAudio(slug, file.name, buf);
  if (!saved.ok) return NextResponse.json({ ok: false, error: saved.error }, { status: 400 });

  const judul = String(form.get('judul') ?? '').trim() || 'Lagu Pilihan Kami';
  if (!setClientMusicConfig(slug, saved.file, judul)) {
    deleteClientAudio(slug); // rollback agar tak ada file yatim
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan ke undangan.' }, { status: 400 });
  }

  revalidatePath(`/u/${slug}`);
  return NextResponse.json({ ok: true, judul, src: `/u/${slug}/photos/${encodeURIComponent(saved.file)}` });
}

export async function DELETE() {
  const s = currentSession('client');
  if (!s) return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });

  deleteClientAudio(s.subject);
  clearClientMusicConfig(s.subject);
  revalidatePath(`/u/${s.subject}`);
  return NextResponse.json({ ok: true });
}

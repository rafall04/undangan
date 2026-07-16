import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentSession } from '@/lib/auth/cookies';
import { getSettings, saveSettings } from '@/lib/settings';

// Pengaturan aplikasi (nomor WA bisnis, paket & harga). Admin-only.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
}

export async function GET() {
  if (!currentSession('admin')) return unauthorized();
  return NextResponse.json({ ok: true, settings: getSettings() });
}

export async function PUT(req: NextRequest) {
  if (!currentSession('admin')) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }
  const r = saveSettings(body);
  if (!r.ok) return NextResponse.json({ ok: false, issues: r.issues }, { status: 400 });
  // Landing & katalog menampilkan harga + nomor WA → render ulang segera.
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, settings: r.settings });
}

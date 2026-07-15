import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentSession } from '@/lib/auth/cookies';
import { verifyAdmin, updateAdminPassword } from '@/lib/auth/session';

// Ganti password admin (verifikasi password lama dulu).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const s = currentSession('admin');
  if (!s) return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Password baru minimal 8 karakter.' }, { status: 400 });
  }
  if (!verifyAdmin(s.subject, parsed.data.currentPassword)) {
    return NextResponse.json({ ok: false, error: 'Password lama salah.' }, { status: 401 });
  }
  updateAdminPassword(s.subject, parsed.data.newPassword);
  return NextResponse.json({ ok: true });
}

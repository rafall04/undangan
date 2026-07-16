import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentSession } from '@/lib/auth/cookies';
import { slugExists } from '@/lib/clients/write';
import { backfillBlur } from '@/lib/clients/photo-slots';

// ============================================================================
// Backfill placeholder blur (LQIP) untuk foto yang diunggah SEBELUM fitur
// blur-up ada. Idempoten: yang sudah punya blur dilewati.
// ============================================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  if (!currentSession('admin')) {
    return NextResponse.json({ ok: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }
  if (!slugExists(params.slug)) {
    return NextResponse.json({ ok: false, error: 'Undangan tidak ditemukan.' }, { status: 404 });
  }

  const r = await backfillBlur(params.slug);
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });

  if (r.generated > 0) revalidatePath(`/u/${params.slug}`);
  return NextResponse.json(r);
}

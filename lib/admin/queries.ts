import { listClientSlugs, loadClient } from '@/lib/clients/load';
import { pasanganPanggilan } from '@/lib/invitation/types';
import { getRsvpRecap } from '@/lib/clients/rsvp';
import { effectiveStatus, type ClientStatus } from '@/lib/clients/meta';
import { getDb } from '@/lib/db';

// ============================================================================
// Agregasi data untuk dashboard admin. Server-only.
// ============================================================================

export interface AdminClientRow {
  slug: string;
  judul: string;
  tema: string;
  status: ClientStatus;
  rsvp: number;
  hadir: number;
  tanggalUtama: string;
  valid: boolean;
}

export function listAdminClients(): AdminClientRow[] {
  return listClientSlugs()
    .map((slug): AdminClientRow => {
      let judul = slug;
      let tema = '—';
      let tanggalUtama = '';
      let valid = true;
      try {
        const b = loadClient(slug);
        if (b) {
          const [a, c] = pasanganPanggilan(b.data);
          judul = `${a} & ${c}`;
          tema = b.tema.namaTampilan;
          tanggalUtama = b.data.tanggalUtama;
        } else {
          valid = false;
        }
      } catch {
        valid = false;
      }
      const r = getRsvpRecap(slug);
      return { slug, judul, tema, status: effectiveStatus(slug), rsvp: r.total, hadir: r.hadir, tanggalUtama, valid };
    })
    .sort((a, b) => a.judul.localeCompare(b.judul));
}

export interface OrderRow {
  id: number;
  nama_pemesan: string | null;
  kontak: string | null;
  paket: string | null;
  slug: string | null;
  status: string;
  created_at: number;
  /** Saran slug dari nama pasangan di config order (untuk tombol Proses). */
  suggestedSlug: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function listOrders(): OrderRow[] {
  const rows = getDb()
    .prepare(
      'SELECT id, nama_pemesan, kontak, paket, slug, status, created_at, config_json FROM orders ORDER BY created_at DESC LIMIT 200',
    )
    .all() as (Omit<OrderRow, 'suggestedSlug'> & { config_json: string | null })[];

  return rows.map((o) => {
    let suggestedSlug = '';
    try {
      const c = o.config_json ? JSON.parse(o.config_json) : null;
      const a = c?.mempelai?.pria?.panggilan;
      const b = c?.mempelai?.wanita?.panggilan;
      if (a && b) suggestedSlug = slugify(`${a}-${b}`);
    } catch {
      /* abaikan */
    }
    return {
      id: o.id,
      nama_pemesan: o.nama_pemesan,
      kontak: o.kontak,
      paket: o.paket,
      slug: o.slug,
      status: o.status,
      created_at: o.created_at,
      suggestedSlug,
    };
  });
}

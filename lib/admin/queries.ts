import { listClientSlugs, loadClientConfig } from '@/lib/clients/load';
import { getTemaBySlug } from '@/lib/engine';
import { rsvpCountsAll } from '@/lib/clients/rsvp';
import { effectiveStatus, type ClientStatus } from '@/lib/clients/meta';
import { getDb } from '@/lib/db';

// ============================================================================
// Agregasi data untuk dashboard admin. Server-only.
// RSVP dihitung sekali (rsvpCountsAll), config dibaca ringan (loadClientConfig,
// bukan full loadClient dengan resolusi foto).
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
  const counts = rsvpCountsAll(); // 1 query untuk semua slug

  return listClientSlugs()
    .map((slug): AdminClientRow => {
      let judul = slug;
      let tema = '—';
      let tanggalUtama = '';
      let valid = true;
      try {
        const cfg = loadClientConfig(slug);
        if (cfg) {
          const [x, y] =
            cfg.urutanNama === 'wanita-dulu'
              ? [cfg.mempelai.wanita.panggilan, cfg.mempelai.pria.panggilan]
              : [cfg.mempelai.pria.panggilan, cfg.mempelai.wanita.panggilan];
          judul = `${x} & ${y}`;
          tema = getTemaBySlug(cfg.temaSlug)?.namaTampilan ?? cfg.temaSlug;
          tanggalUtama = cfg.tanggalUtama;
        } else {
          valid = false;
        }
      } catch {
        valid = false;
      }
      const c = counts.get(slug);
      return {
        slug,
        judul,
        tema,
        status: effectiveStatus(slug),
        rsvp: c?.total ?? 0,
        hadir: c?.hadir ?? 0,
        tanggalUtama,
        valid,
      };
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
  /** Saran slug dari nama pasangan di config order (hanya order 'baru'). */
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
    // Hanya parse config utk order yang masih 'baru' (butuh saran slug).
    if (o.status === 'baru' && o.config_json) {
      try {
        const c = JSON.parse(o.config_json);
        const a = c?.mempelai?.pria?.panggilan;
        const b = c?.mempelai?.wanita?.panggilan;
        if (a && b) suggestedSlug = slugify(`${a}-${b}`);
      } catch {
        /* abaikan */
      }
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

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
}

export function listOrders(): OrderRow[] {
  return getDb()
    .prepare(
      'SELECT id, nama_pemesan, kontak, paket, slug, status, created_at FROM orders ORDER BY created_at DESC LIMIT 200',
    )
    .all() as OrderRow[];
}

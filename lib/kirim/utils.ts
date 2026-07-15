// ============================================================================
// FASE 5 — Utilitas alat kirim (pure, mudah diuji).
// ============================================================================

export interface Tamu {
  nama: string;
  telepon?: string;
  grup?: string;
}

/** Normalisasi nomor: 08xx → 628xx, +62 → 62, 8xx → 628xx. '' bila tak valid. */
export function normalizePhone(raw?: string): string {
  if (!raw) return '';
  let n = raw.replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (!n) return '';
  if (n.startsWith('0')) n = '62' + n.slice(1);
  else if (n.startsWith('62')) {
    /* sudah benar */
  } else if (n.startsWith('8')) n = '62' + n;
  // Nomor Indonesia wajar: 9–15 digit.
  return n.length >= 9 && n.length <= 15 ? n : '';
}

/**
 * Parse daftar tamu dari teks tempelan. Satu tamu per baris.
 * Format: "Nama" atau "Nama<TAB/koma/;>08xxx". Toleran spasi berlebih & juga
 * "Nama 08xxx" (nomor di akhir dipisah spasi).
 */
export function parseGuests(text: string): Tamu[] {
  const out: Tamu[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    let nama = line;
    let tel: string | undefined;

    if (/[\t,;]/.test(line)) {
      const parts = line.split(/[\t,;]+/);
      nama = parts[0] ?? line;
      tel = parts.slice(1).join(' ');
    } else {
      // "Nama 08xxxx" — nomor telepon di akhir.
      const m = line.match(/^(.+?)\s+(\+?\d[\d\s-]{6,})$/);
      if (m) {
        nama = m[1];
        tel = m[2];
      }
    }

    nama = nama.replace(/\s+/g, ' ').trim();
    if (!nama) continue;
    const telepon = normalizePhone(tel);
    out.push({ nama, telepon: telepon || undefined });
  }
  return out;
}

/** Buang tamu duplikat (berdasarkan nama, case-insensitive). */
export function dedupeGuests(list: Tamu[]): Tamu[] {
  const seen = new Set<string>();
  const out: Tamu[] = [];
  for (const t of list) {
    const key = t.nama.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Isi template dengan {nama} & {link}. */
export function buildMessage(template: string, nama: string, link: string): string {
  return template.replace(/\{nama\}/g, nama).replace(/\{link\}/g, link);
}

/** Tautan personal undangan untuk seorang tamu. */
export function personalLink(origin: string, basePath: string, nama: string): string {
  return `${origin}${basePath}?to=${encodeURIComponent(nama)}`;
}

/** Deep-link WhatsApp untuk seorang tamu. */
export function waUrl(telepon: string, pesan: string): string {
  return `https://wa.me/${normalizePhone(telepon)}?text=${encodeURIComponent(pesan)}`;
}

/** Kunci status kirim (nama dinormalisasi). */
export function statusKey(nama: string): string {
  return nama.trim().toLowerCase();
}

const DEFAULT_TEMPLATE = `Yth. Bapak/Ibu/Saudara/i {nama}

Tanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri acara pernikahan kami.

Berikut tautan undangan digital kami:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir. Terima kasih.`;

export function defaultTemplate(): string {
  return DEFAULT_TEMPLATE;
}

/** Ubah baris tamu + status menjadi CSV (dengan quoting aman). */
export function toCSV(
  rows: Array<{ nama: string; telepon?: string; link: string; terkirim: boolean }>,
): string {
  const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const header = ['Nama', 'Telepon', 'Link Undangan', 'Status'].map(q).join(',');
  const body = rows
    .map((r) =>
      [q(r.nama), q(r.telepon ?? ''), q(r.link), q(r.terkirim ? 'Terkirim' : 'Belum')].join(','),
    )
    .join('\r\n');
  return `${header}\r\n${body}\r\n`;
}

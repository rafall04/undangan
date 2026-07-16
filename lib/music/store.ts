import { existsSync, mkdirSync, writeFileSync, unlinkSync, statSync, readdirSync } from 'node:fs';
import { join, extname, basename, normalize } from 'node:path';
import { MUSIC_LIBRARY, type MusicTrack } from './library';
import { getSettings } from '@/lib/settings';

// ============================================================================
// Penyimpanan file musik yang DIUNGGAH admin (server-only).
//
// PENTING: disimpan di content/media/ — BUKAN public/. Folder public/ ikut
// ter-bake ke image Docker dan TIDAK di-bind-mount, jadi file yang ditaruh di
// sana akan HILANG setiap redeploy. content/ di-bind-mount rw → persisten.
// File disajikan lewat route /media/lib/<file> (lihat app/media/lib/[file]).
// ============================================================================

const AUDIO_EXT = new Set(['.mp3', '.m4a', '.ogg', '.wav']);
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8 MB — jaga undangan tetap ringan

export const MIME: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

export function musicDir(): string {
  return join(process.cwd(), 'content', 'media');
}

/** Nama file aman: basename saja, karakter dibatasi, ekstensi audio. */
export function sanitizeAudioName(name: string): string | null {
  const b = basename(name).replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!b || b.startsWith('.')) return null;
  if (!AUDIO_EXT.has(extname(b).toLowerCase())) return null;
  return b;
}

/** Path aman ke file musik (cegah path traversal). null bila tidak valid/ada. */
export function musicFilePath(file: string): string | null {
  const base = normalize(file).replace(/^([.][.][/\\])+/g, '').replace(/[/\\]/g, '');
  if (!base || base.startsWith('.')) return null;
  if (!AUDIO_EXT.has(extname(base).toLowerCase())) return null;
  const p = join(musicDir(), base);
  return existsSync(p) ? p : null;
}

/** Hindari menimpa file lain: tambahkan sufiks bila nama sudah dipakai. */
function uniqueName(dir: string, safe: string): string {
  const ext = extname(safe);
  const base = basename(safe, ext);
  let name = safe;
  let i = 2;
  while (existsSync(join(dir, name))) name = `${base}-${i++}${ext}`;
  return name;
}

export function saveMusicFile(
  origName: string,
  buf: Buffer,
): { ok: true; file: string } | { ok: false; error: string } {
  const safe = sanitizeAudioName(origName);
  if (!safe) return { ok: false, error: 'Format tidak didukung (mp3/m4a/ogg/wav).' };
  if (buf.byteLength > MAX_AUDIO_BYTES) return { ok: false, error: 'Ukuran melebihi 8 MB.' };
  const dir = musicDir();
  mkdirSync(dir, { recursive: true });
  const file = uniqueName(dir, safe);
  writeFileSync(join(dir, file), buf);
  return { ok: true, file };
}

export function deleteMusicFile(file: string): boolean {
  const p = musicFilePath(file);
  if (!p) return false;
  try {
    unlinkSync(p);
    return true;
  } catch {
    return false;
  }
}

export function musicFileSize(file: string): number {
  const p = musicFilePath(file);
  try {
    return p ? statSync(p).size : 0;
  } catch {
    return 0;
  }
}

/**
 * Playlist efektif = library bawaan (public/media/library) + lagu unggahan admin
 * (content/media, disajikan via /media/lib/<file>). Dipakai picker editor.
 * Server-only (baca DB) → oper hasilnya sebagai prop ke komponen client.
 */
export function effectiveMusicTracks(): MusicTrack[] {
  const uploaded: MusicTrack[] = getSettings().musik.map((t) => ({
    id: t.id,
    judul: t.judul,
    mood: t.mood || 'Unggahan',
    src: `/media/lib/${encodeURIComponent(t.file)}`,
  }));
  return [...MUSIC_LIBRARY, ...uploaded];
}

/** File audio yatim di content/media/ (tak terdaftar di settings) — untuk diagnostik. */
export function listMusicFiles(): string[] {
  const dir = musicDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => AUDIO_EXT.has(extname(f).toLowerCase()));
}

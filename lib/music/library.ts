// ============================================================================
// Library backsound bebas-royalti. Track default = komposisi orisinil (dibuat
// scripts/gen-music.mts → 0% hak cipta). Tambah track royalty-free "kekinian"
// dari sumber legal (YouTube Audio Library, Pixabay Music, Uppbeat, Incompetech):
//   1) taruh file .mp3 di public/media/library/
//   2) tambahkan satu baris di MUSIC_LIBRARY di bawah.
// Data murni → aman dipakai di client & server.
// ============================================================================

export interface MusicTrack {
  id: string;
  judul: string;
  mood: string;
  src: string;
}

export const MUSIC_LIBRARY: MusicTrack[] = [
  { id: 'tenang', judul: 'Tenang', mood: 'Lembut', src: '/media/library/tenang.mp3' },
  { id: 'romantis', judul: 'Romantis', mood: 'Romantis', src: '/media/library/romantis.mp3' },
  { id: 'ceria', judul: 'Ceria', mood: 'Ceria', src: '/media/library/ceria.mp3' },
];

export function isLibraryTrack(src?: string): boolean {
  return !!src && MUSIC_LIBRARY.some((t) => t.src === src);
}

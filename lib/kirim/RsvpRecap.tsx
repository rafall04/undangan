import type { RsvpRecapData } from '@/lib/clients/rsvp';

// ============================================================================
// Rekap RSVP (server component) — ditampilkan di atas KirimTool untuk pemilik.
// Data nyata dari SQLite (bukan localStorage). Refresh halaman = data terbaru.
// ============================================================================

const LABEL: Record<string, string> = { hadir: 'Hadir', tidak: 'Tidak Hadir', ragu: 'Masih Ragu' };
const BADGE: Record<string, string> = {
  hadir: 'bg-green-600/12 text-green-800',
  tidak: 'bg-red-600/12 text-red-800',
  ragu: 'bg-amber-600/14 text-amber-800',
};

function tanggal(ms: number): string {
  return new Date(ms).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-brand-line bg-brand-paper px-4 py-3 text-center">
      <div className={`font-brand-serif text-2xl font-semibold ${tone ?? 'text-brand-ink'}`}>{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-brand-muted">{label}</div>
    </div>
  );
}

export function RsvpRecap({ recap }: { recap: RsvpRecapData }) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-brand-serif text-lg font-semibold text-brand-ink">Rekap RSVP &amp; Ucapan</h2>
        <span className="text-xs text-brand-muted">{recap.total} balasan tamu</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total RSVP" value={recap.total} />
        <Stat label="Hadir" value={recap.hadir} tone="text-green-700" />
        <Stat label="Tidak Hadir" value={recap.tidak} tone="text-red-700" />
        <Stat label="Estimasi Orang" value={recap.estimasiHadir} tone="text-brand-gold" />
      </div>

      {recap.entries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-brand-line py-8 text-center text-sm text-brand-muted">
          Belum ada RSVP masuk. Balasan tamu akan muncul di sini secara otomatis.
        </p>
      ) : (
        <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
          {recap.entries.map((e) => (
            <li key={e.id} className="rounded-xl border border-brand-line bg-brand-paper px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-brand-ink">{e.nama}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE[e.kehadiran] ?? ''}`}>
                  {LABEL[e.kehadiran] ?? e.kehadiran}
                </span>
              </div>
              {e.pesan && <p className="mt-1 text-sm leading-relaxed text-brand-ink/90">{e.pesan}</p>}
              <p className="mt-1 text-[10px] text-brand-muted">{tanggal(e.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

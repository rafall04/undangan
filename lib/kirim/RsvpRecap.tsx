import type { RsvpRecapData } from '@/lib/clients/rsvp';

// ============================================================================
// Rekap RSVP (server component) — dipakai di portal client & editor admin.
// UI "app" netral. Data nyata dari SQLite. Refresh = data terbaru.
// ============================================================================

const LABEL: Record<string, string> = { hadir: 'Hadir', tidak: 'Tidak Hadir', ragu: 'Masih Ragu' };
const BADGE: Record<string, string> = {
  hadir: 'bg-emerald-100 text-emerald-700',
  tidak: 'bg-red-100 text-red-700',
  ragu: 'bg-amber-100 text-amber-700',
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
    <div className="ui-card p-4 text-center">
      <div className={`text-2xl font-semibold ${tone ?? 'text-slate-900'}`}>{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

export function RsvpRecap({ recap }: { recap: RsvpRecapData }) {
  return (
    <section className="ui-container max-w-3xl pt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="ui-title text-base">Rekap RSVP &amp; Ucapan</h2>
        <span className="text-xs text-slate-500">{recap.total} balasan tamu</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total RSVP" value={recap.total} />
        <Stat label="Hadir" value={recap.hadir} tone="text-emerald-600" />
        <Stat label="Tidak Hadir" value={recap.tidak} tone="text-red-600" />
        <Stat label="Estimasi Orang" value={recap.estimasiHadir} tone="text-amber-600" />
      </div>

      {recap.entries.length === 0 ? (
        <div className="ui-card mt-4 border-dashed py-8 text-center text-sm text-slate-500">
          Belum ada RSVP masuk. Balasan tamu akan muncul di sini secara otomatis.
        </div>
      ) : (
        <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
          {recap.entries.map((e) => (
            <li key={e.id} className="ui-card p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">{e.nama}</span>
                <span className={`ui-badge ${BADGE[e.kehadiran] ?? 'bg-slate-100 text-slate-600'}`}>
                  {LABEL[e.kehadiran] ?? e.kehadiran}
                </span>
              </div>
              {e.pesan && <p className="mt-1 text-sm leading-relaxed text-slate-600">{e.pesan}</p>}
              <p className="mt-1 text-[10px] text-slate-400">{tanggal(e.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

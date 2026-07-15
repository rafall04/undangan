// ============================================================================
// #5 — Instrumentasi analytics (siap backend).
// Lapisan event yang bisa dicolok backend nyata (mis. bersama RSVP di #1).
// Default: hanya log di dev (TANPA localStorage di halaman tamu — sesuai
// batasan). Agregat "berapa yang buka" muncul setelah provider backend dipasang
// (atau lewat Vercel Web Analytics, lihat README).
// ============================================================================

export type AnalyticsEvent =
  | 'invitation_open'
  | 'rsvp_submit'
  | 'wa_send'
  | 'gift_open'
  | 'calendar_add';

export interface AnalyticsProps {
  context?: string; // mis. "client:budi-sari" atau "demo:kawung-ratri"
  theme?: string;
  [k: string]: unknown;
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
}

// Provider default: no-op di produksi, log ringan di dev.
const consoleProvider: AnalyticsProvider = {
  track(event, props) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, props ?? {});
    }
  },
};

let provider: AnalyticsProvider = consoleProvider;

/** Pasang provider nyata (mis. beacon ke backend, dipasang bersama #1). */
export function setAnalyticsProvider(p: AnalyticsProvider): void {
  provider = p;
}

/** Kirim satu event. Aman dipanggil di mana saja (gagal → diam). */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  try {
    provider.track(event, props);
  } catch {
    /* jangan pernah ganggu UX undangan */
  }
}

/**
 * Contoh provider beacon (referensi untuk #1). Kirim event ke endpoint sendiri.
 * Belum diaktifkan — panggil setAnalyticsProvider(beaconProvider('/api/track')).
 */
export function beaconProvider(endpoint: string): AnalyticsProvider {
  return {
    track(event, props) {
      if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
      try {
        navigator.sendBeacon(endpoint, JSON.stringify({ event, props, t: Date.now() }));
      } catch {
        /* abaikan */
      }
    },
  };
}

import { describe, it, expect, vi } from 'vitest';
import { track, setAnalyticsProvider, beaconProvider, type AnalyticsEvent } from '@/lib/analytics';

describe('analytics', () => {
  it('track meneruskan event ke provider aktif', () => {
    const calls: Array<[AnalyticsEvent, unknown]> = [];
    setAnalyticsProvider({ track: (e, p) => calls.push([e, p]) });
    track('invitation_open', { context: 'client:budi-sari', theme: 'sakinah' });
    track('rsvp_submit', { kehadiran: 'hadir' });
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toBe('invitation_open');
    expect(calls[1][1]).toEqual({ kehadiran: 'hadir' });
  });

  it('provider yang melempar tidak mengganggu (track aman)', () => {
    setAnalyticsProvider({
      track: () => {
        throw new Error('boom');
      },
    });
    expect(() => track('wa_send')).not.toThrow();
  });

  it('beaconProvider tanpa sendBeacon tidak error', () => {
    const p = beaconProvider('/api/track');
    expect(() => p.track('gift_open')).not.toThrow();
  });
});

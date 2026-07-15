'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getAllTema, getTemaBySlug, fontsByRole, MOTIFS_META } from '@/lib/engine';
import { contrastRatio } from '@/lib/engine/contrast';
import { configKlienSchema } from '@/lib/clients/schema';
import { type Draft, DEFAULT_DRAFT, loadDraft, draftToConfigJson, STUDIO_KEY } from './draft';
import { generatePalette } from './palette-gen';
import { type StylePreset, loadPresets, saveUserPreset, deleteUserPreset, BUILTIN_PRESETS } from './presets';

const PALETTE_KEYS: Array<['bg' | 'surface' | 'primary' | 'accent' | 'ink' | 'muted', string]> = [
  ['bg', 'Latar'],
  ['surface', 'Kartu'],
  ['primary', 'Utama'],
  ['accent', 'Aksen'],
  ['ink', 'Teks'],
  ['muted', 'Teks redup'],
];

// ============================================================================
// Panel edit mandiri: form data undangan + pratinjau langsung (iframe) +
// ekspor config.json. Draft disimpan di localStorage (khusus halaman ini).
// ============================================================================

const TEMA = getAllTema().map((t) => ({ slug: t.slug, nama: t.namaTampilan, kategori: t.kategori }));

const inputCls =
  'w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-gold';
const labelCls = 'block text-xs font-medium text-brand-muted mb-1';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="rounded-xl border border-brand-line bg-brand-paper p-4">
      <summary className="cursor-pointer font-brand-serif text-lg font-semibold text-brand-ink">{title}</summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

export function StudioEditor({
  mode = 'studio',
  slug,
  initialConfig,
  onSaved,
}: {
  /** 'studio' = mandiri (localStorage + unduh); 'admin' = simpan ke server. */
  mode?: 'studio' | 'admin';
  slug?: string;
  initialConfig?: unknown;
  onSaved?: () => void;
} = {}) {
  // Preview membaca localStorage; pakai key per-slug di mode admin agar tak
  // menimpa draft studio pengguna lain.
  const storageKey = mode === 'admin' && slug ? `rafayana:studio:admin:${slug}` : STUDIO_KEY;
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [version, setVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveIssues, setSaveIssues] = useState<string[]>([]);
  const [order, setOrder] = useState({ nama: '', kontak: '', paket: '' });
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');
  const [presets, setPresets] = useState<StylePreset[]>(BUILTIN_PRESETS);
  const [seed, setSeed] = useState('#6b4423');
  const [paletMode, setPaletMode] = useState<'light' | 'dark'>('light');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (mode === 'admin') {
      const cfg = initialConfig && typeof initialConfig === 'object' ? (initialConfig as Partial<Draft>) : {};
      // Isi HANYA field struktural wajib (yang diakses form tanpa fallback) agar
      // form tak error — jangan bawa field dekoratif DEFAULT (mis. quote) yang
      // akan mengotori config klien saat disimpan.
      const base: Partial<Draft> = {
        temaSlug: DEFAULT_DRAFT.temaSlug,
        islami: false,
        accessKey: '',
        urutanNama: 'pria-dulu',
        tanggalUtama: DEFAULT_DRAFT.tanggalUtama,
        mempelai: DEFAULT_DRAFT.mempelai,
        acara: DEFAULT_DRAFT.acara,
      };
      setDraft({ ...base, ...cfg } as Draft);
    } else {
      setDraft(loadDraft());
    }
    setPresets(loadPresets());
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simpan draft ke localStorage (untuk iframe pratinjau) + segarkan (debounce).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      /* abaikan */
    }
    const t = setTimeout(() => setVersion((v) => v + 1), 900);
    return () => clearTimeout(t);
  }, [draft, hydrated, storageKey]);

  const issues = useMemo(() => {
    const r = configKlienSchema.safeParse(draft);
    return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  }, [draft]);

  // Setter dalam (immutable).
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setPria = (patch: Partial<Draft['mempelai']['pria']>) =>
    setDraft((d) => ({ ...d, mempelai: { ...d.mempelai, pria: { ...d.mempelai.pria, ...patch } } }));
  const setWanita = (patch: Partial<Draft['mempelai']['wanita']>) =>
    setDraft((d) => ({ ...d, mempelai: { ...d.mempelai, wanita: { ...d.mempelai.wanita, ...patch } } }));
  const setAcara = (i: number, patch: Partial<Draft['acara'][number]>) =>
    setDraft((d) => ({ ...d, acara: d.acara.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) }));

  function unduh() {
    const blob = new Blob([draftToConfigJson(draft)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function submitOrder() {
    if (!order.nama.trim() || !order.kontak.trim() || orderBusy) return;
    setOrderBusy(true);
    setOrderMsg('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nama: order.nama.trim(),
          kontak: order.kontak.trim(),
          paket: order.paket || undefined,
          config: draft,
        }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setOrderMsg(j?.error ?? 'Gagal mengirim pengajuan.');
      } else {
        setOrderMsg('Pengajuan terkirim! Admin akan menghubungi Anda lewat kontak yang diberikan. 🤍');
        setOrder({ nama: '', kontak: '', paket: '' });
      }
    } catch {
      setOrderMsg('Gagal terhubung. Coba lagi.');
    } finally {
      setOrderBusy(false);
    }
  }

  function salin() {
    navigator.clipboard?.writeText(draftToConfigJson(draft)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }
  function reset() {
    if (confirm('Kosongkan semua isian dan mulai dari contoh default?')) setDraft(DEFAULT_DRAFT);
  }

  // Mode admin: simpan draft langsung ke config.json klien (server, tervalidasi).
  async function saveToServer() {
    if (!slug || saving) return;
    setSaving(true);
    setSaveMsg('');
    setSaveIssues([]);
    try {
      const clean = JSON.parse(draftToConfigJson(draft));
      const res = await fetch(`/api/admin/clients/${slug}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(clean),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; issues?: string[]; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setSaveIssues(j?.issues ?? [j?.error ?? 'Gagal menyimpan.']);
      } else {
        setSaveMsg('Tersimpan ✓ Undangan sudah diperbarui.');
        onSaved?.();
      }
    } catch {
      setSaveMsg('Gagal terhubung. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  const rek = draft.amplop?.rekening ?? [];
  const setRek = (next: typeof rek) => set({ amplop: { ...draft.amplop, rekening: next } });

  // --- Kustomisasi lanjutan ---
  const tema = useMemo(() => getTemaBySlug(draft.temaSlug), [draft.temaSlug]);
  const customFams = draft.customFonts ?? [];
  const fontOpts = (role: 'heading' | 'script' | 'body') => [
    { label: 'Ikut tema', value: '' },
    ...fontsByRole(role).map((f) => ({ label: f.nama, value: f.family })),
    ...customFams.map((c) => ({ label: `${c.family} (custom)`, value: `"${c.family}"` })),
  ];
  const setFont = (role: 'heading' | 'script' | 'body', value: string) =>
    setDraft((d) => {
      const fo = { ...d.fontOverride, [role]: value || undefined };
      return { ...d, fontOverride: fo };
    });
  const setColor = (key: (typeof PALETTE_KEYS)[number][0], hex: string) =>
    setDraft((d) => ({ ...d, paletteOverride: { ...d.paletteOverride, [key]: hex } }));
  const clearColors = () => set({ paletteOverride: undefined });

  // Warna efektif (override ?? tema) untuk cek kontras & nilai awal picker.
  const eff = (key: (typeof PALETTE_KEYS)[number][0]) =>
    draft.paletteOverride?.[key] ?? tema?.palet[key] ?? '#000000';
  const kontrasWarn = useMemo(() => {
    if (!draft.paletteOverride || !tema) return '';
    try {
      const inkBg = contrastRatio(eff('ink'), eff('bg'));
      const inkSurf = contrastRatio(eff('ink'), eff('surface'));
      const lo = Math.min(inkBg, inkSurf);
      if (lo < 4.5) return `Kontras teks rendah (${lo.toFixed(1)}:1). Disarankan ≥ 4.5:1 agar mudah dibaca.`;
    } catch {
      /* hex belum lengkap */
    }
    return '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.paletteOverride, tema]);

  function unggahFont(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const family = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Font Kustom';
      setDraft((d) => ({
        ...d,
        customFonts: [...(d.customFonts ?? []), { family, file: file.name, dataUrl: String(reader.result) }],
      }));
    };
    reader.readAsDataURL(file);
  }

  function buatPalet() {
    set({ paletteOverride: generatePalette(seed, paletMode) });
  }
  function terapkanPreset(p: StylePreset) {
    set({ fontOverride: p.fontOverride, paletteOverride: p.paletteOverride, motifOverride: p.motifOverride });
  }
  function simpanPreset() {
    const nama = window.prompt('Nama gaya:')?.trim();
    if (!nama) return;
    setPresets(saveUserPreset({ nama, fontOverride: draft.fontOverride, paletteOverride: draft.paletteOverride, motifOverride: draft.motifOverride }));
  }
  function hapusPreset(id: string) {
    setPresets(deleteUserPreset(id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* FORM */}
      <div className="space-y-4">
        <Section title="Tema & Pengaturan">
          <Field label="Tema (lihat katalog untuk pilihan)">
            <select className={inputCls} value={draft.temaSlug} onChange={(e) => set({ temaSlug: e.target.value })}>
              {TEMA.map((t) => (
                <option key={t.slug} value={t.slug}>{t.nama} — {t.kategori}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nuansa Islami (salam + ayat)">
              <select className={inputCls} value={draft.islami ? '1' : '0'} onChange={(e) => set({ islami: e.target.value === '1' })}>
                <option value="0">Tidak</option>
                <option value="1">Ya</option>
              </select>
            </Field>
            <Field label="Urutan nama">
              <select className={inputCls} value={draft.urutanNama} onChange={(e) => set({ urutanNama: e.target.value as Draft['urutanNama'] })}>
                <option value="pria-dulu">Pria dulu</option>
                <option value="wanita-dulu">Wanita dulu</option>
              </select>
            </Field>
          </div>
          <Field label="Tanggal & jam utama"><input type="datetime-local" className={inputCls} value={draft.tanggalUtama.slice(0, 16)} onChange={(e) => set({ tanggalUtama: e.target.value + ':00' })} /></Field>
          <Field label="Hashtag (tanpa #)"><input className={inputCls} value={draft.hashtag ?? ''} onChange={(e) => set({ hashtag: e.target.value })} /></Field>
          <Field label="Kode akses alat kirim"><input className={inputCls} value={draft.accessKey} onChange={(e) => set({ accessKey: e.target.value })} /></Field>
        </Section>

        <Section title="Mempelai Pria">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Panggilan"><input className={inputCls} value={draft.mempelai.pria.panggilan} onChange={(e) => setPria({ panggilan: e.target.value })} /></Field>
            <Field label="Nama lengkap"><input className={inputCls} value={draft.mempelai.pria.namaLengkap} onChange={(e) => setPria({ namaLengkap: e.target.value })} /></Field>
            <Field label="Ayah"><input className={inputCls} value={draft.mempelai.pria.ayah} onChange={(e) => setPria({ ayah: e.target.value })} /></Field>
            <Field label="Ibu"><input className={inputCls} value={draft.mempelai.pria.ibu} onChange={(e) => setPria({ ibu: e.target.value })} /></Field>
            <Field label="Urutan (Putra ke-…)"><input className={inputCls} value={draft.mempelai.pria.urutan ?? ''} onChange={(e) => setPria({ urutan: e.target.value })} /></Field>
            <Field label="Instagram (tanpa @)"><input className={inputCls} value={draft.mempelai.pria.instagram ?? ''} onChange={(e) => setPria({ instagram: e.target.value })} /></Field>
          </div>
        </Section>

        <Section title="Mempelai Wanita">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Panggilan"><input className={inputCls} value={draft.mempelai.wanita.panggilan} onChange={(e) => setWanita({ panggilan: e.target.value })} /></Field>
            <Field label="Nama lengkap"><input className={inputCls} value={draft.mempelai.wanita.namaLengkap} onChange={(e) => setWanita({ namaLengkap: e.target.value })} /></Field>
            <Field label="Ayah"><input className={inputCls} value={draft.mempelai.wanita.ayah} onChange={(e) => setWanita({ ayah: e.target.value })} /></Field>
            <Field label="Ibu"><input className={inputCls} value={draft.mempelai.wanita.ibu} onChange={(e) => setWanita({ ibu: e.target.value })} /></Field>
            <Field label="Urutan (Putri ke-…)"><input className={inputCls} value={draft.mempelai.wanita.urutan ?? ''} onChange={(e) => setWanita({ urutan: e.target.value })} /></Field>
            <Field label="Instagram (tanpa @)"><input className={inputCls} value={draft.mempelai.wanita.instagram ?? ''} onChange={(e) => setWanita({ instagram: e.target.value })} /></Field>
          </div>
        </Section>

        {draft.acara.slice(0, 2).map((a, i) => (
          <Section key={i} title={`Acara ${i + 1}`}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama acara"><input className={inputCls} value={a.nama} onChange={(e) => setAcara(i, { nama: e.target.value })} /></Field>
              <Field label="Tanggal"><input type="date" className={inputCls} value={a.tanggal} onChange={(e) => setAcara(i, { tanggal: e.target.value })} /></Field>
              <Field label="Mulai"><input className={inputCls} placeholder="08:00" value={a.waktuMulai ?? ''} onChange={(e) => setAcara(i, { waktuMulai: e.target.value })} /></Field>
              <Field label="Selesai"><input className={inputCls} placeholder="10:00 / Selesai" value={a.waktuSelesai ?? ''} onChange={(e) => setAcara(i, { waktuSelesai: e.target.value })} /></Field>
              <Field label="Zona waktu">
                <select className={inputCls} value={a.zonaWaktu ?? 'WIB'} onChange={(e) => setAcara(i, { zonaWaktu: e.target.value as 'WIB' })}>
                  <option>WIB</option><option>WITA</option><option>WIT</option>
                </select>
              </Field>
              <Field label="Tempat"><input className={inputCls} value={a.tempat} onChange={(e) => setAcara(i, { tempat: e.target.value })} /></Field>
            </div>
            <Field label="Alamat"><input className={inputCls} value={a.alamat ?? ''} onChange={(e) => setAcara(i, { alamat: e.target.value })} /></Field>
            <Field label="Link Google Maps (opsional)"><input className={inputCls} value={a.mapsUrl ?? ''} onChange={(e) => setAcara(i, { mapsUrl: e.target.value })} /></Field>
            <Field label="Embed Maps (src iframe, opsional)"><input className={inputCls} value={a.mapsEmbed ?? ''} onChange={(e) => setAcara(i, { mapsEmbed: e.target.value })} /></Field>
          </Section>
        ))}

        <Section title={draft.islami ? 'Ayat' : 'Kutipan'}>
          {draft.islami ? (
            <>
              <Field label="Teks ayat"><textarea className={`${inputCls} min-h-[70px]`} value={draft.ayat?.teks ?? ''} onChange={(e) => set({ ayat: { teks: e.target.value, sumber: draft.ayat?.sumber ?? 'QS. Ar-Rum: 21' } })} /></Field>
              <Field label="Sumber"><input className={inputCls} value={draft.ayat?.sumber ?? ''} onChange={(e) => set({ ayat: { teks: draft.ayat?.teks ?? '', sumber: e.target.value } })} /></Field>
            </>
          ) : (
            <>
              <Field label="Teks kutipan"><textarea className={`${inputCls} min-h-[70px]`} value={draft.quote?.teks ?? ''} onChange={(e) => set({ quote: { teks: e.target.value, sumber: draft.quote?.sumber ?? '' } })} /></Field>
              <Field label="Sumber"><input className={inputCls} value={draft.quote?.sumber ?? ''} onChange={(e) => set({ quote: { teks: draft.quote?.teks ?? '', sumber: e.target.value } })} /></Field>
            </>
          )}
        </Section>

        <Section title="Amplop Digital">
          {rek.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={inputCls} placeholder="Bank/E-wallet" value={r.bank} onChange={(e) => setRek(rek.map((x, idx) => (idx === i ? { ...x, bank: e.target.value } : x)))} />
              <input className={inputCls} placeholder="Nomor" value={r.nomor} onChange={(e) => setRek(rek.map((x, idx) => (idx === i ? { ...x, nomor: e.target.value } : x)))} />
              <button className="rounded-lg px-2 text-sm text-red-500 hover:text-red-700" onClick={() => setRek(rek.filter((_, idx) => idx !== i))} aria-label="Hapus">✕</button>
              <input className={`${inputCls} col-span-3`} placeholder="Atas nama" value={r.atasNama} onChange={(e) => setRek(rek.map((x, idx) => (idx === i ? { ...x, atasNama: e.target.value } : x)))} />
            </div>
          ))}
          <button onClick={() => setRek([...rek, { bank: '', nomor: '', atasNama: '', jenis: 'bank' }])} className="text-xs font-medium text-brand-gold hover:underline">+ Tambah rekening</button>
        </Section>

        <Section title="Preset Gaya (satu ketuk)">
          <p className="text-xs text-brand-muted">Terapkan kombinasi font + warna + motif siap pakai, lalu boleh disesuaikan lagi.</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-white px-1 py-0.5">
                <button onClick={() => terapkanPreset(p)} className="rounded-full px-3 py-1 text-xs font-medium text-brand-ink hover:text-brand-gold">
                  {p.nama}{p.builtin ? '' : ' •'}
                </button>
                {!p.builtin && <button onClick={() => hapusPreset(p.id)} className="pr-1.5 text-xs text-red-400 hover:text-red-600" aria-label="Hapus preset">✕</button>}
              </span>
            ))}
          </div>
          <button onClick={simpanPreset} className="text-xs font-medium text-brand-gold hover:underline">+ Simpan gaya saat ini sebagai preset</button>
        </Section>

        <Section title="Kustomisasi Lanjutan (opsional)">
          <p className="text-xs text-brand-muted">Kosongkan untuk mengikuti tema. Font & warna ini menimpa tema.</p>

          <div className="grid grid-cols-3 gap-2">
            <Field label="Font judul">
              <select className={inputCls} value={draft.fontOverride?.heading ?? ''} onChange={(e) => setFont('heading', e.target.value)}>
                {fontOpts('heading').map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Font script">
              <select className={inputCls} value={draft.fontOverride?.script ?? ''} onChange={(e) => setFont('script', e.target.value)}>
                {fontOpts('script').map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Font teks">
              <select className={inputCls} value={draft.fontOverride?.body ?? ''} onChange={(e) => setFont('body', e.target.value)}>
                {fontOpts('body').map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Motif ornamen">
            <select className={inputCls} value={draft.motifOverride ?? ''} onChange={(e) => set({ motifOverride: e.target.value || undefined })}>
              <option value="">Ikut tema</option>
              {MOTIFS_META.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </Field>

          <div className="rounded-lg border border-brand-line bg-white p-3">
            <span className={labelCls}>Generator palet otomatis (1 warna → palet lolos kontras)</span>
            <div className="flex flex-wrap items-center gap-2">
              <input type="color" value={seed} onChange={(e) => setSeed(e.target.value)} className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Warna dasar" />
              <input value={seed} onChange={(e) => setSeed(e.target.value)} className={`${inputCls} w-28`} />
              <select className={`${inputCls} w-28`} value={paletMode} onChange={(e) => setPaletMode(e.target.value as 'light' | 'dark')}>
                <option value="light">Terang</option>
                <option value="dark">Gelap</option>
              </select>
              <button onClick={buatPalet} className="rounded-full bg-brand-gold px-4 py-2 text-xs font-medium text-white hover:opacity-90">Buat Palet</button>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className={labelCls}>Warna kustom</span>
              {draft.paletteOverride && <button onClick={clearColors} className="text-xs text-brand-gold hover:underline">Ikut tema</button>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PALETTE_KEYS.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-brand-line bg-white px-2 py-1.5">
                  <input type="color" value={eff(key)} onChange={(e) => setColor(key, e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" />
                  <span className="text-xs text-brand-muted">{label}</span>
                </label>
              ))}
            </div>
            {kontrasWarn && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">⚠ {kontrasWarn}</p>}
          </div>

          <div>
            <span className={labelCls}>Font milik sendiri (.woff2/.ttf/.otf)</span>
            <input type="file" accept=".woff2,.woff,.ttf,.otf" onChange={(e) => e.target.files?.[0] && unggahFont(e.target.files[0])} className="block w-full text-xs text-brand-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-ink file:px-3 file:py-1.5 file:text-xs file:text-brand-cream" />
            {customFams.length > 0 && (
              <ul className="mt-2 space-y-1">
                {customFams.map((c, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-brand-cream px-3 py-1.5 text-xs">
                    <span style={{ fontFamily: `"${c.family}"` }}>{c.family} — <span className="text-brand-muted">{c.file}</span></span>
                    <button onClick={() => set({ customFonts: customFams.filter((_, idx) => idx !== i) })} className="text-red-500">✕</button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-[11px] text-brand-muted">Pilih font lalu jadikan Font judul/script/teks di atas. Saat ekspor, taruh file font di folder klien.</p>
          </div>
        </Section>

        <Section title="Template Pesan & Penutup">
          <Field label="Template WA ({nama} & {link})"><textarea className={`${inputCls} min-h-[110px]`} value={draft.templatePesan ?? ''} onChange={(e) => set({ templatePesan: e.target.value })} /></Field>
          <Field label="Kalimat penutup"><textarea className={`${inputCls} min-h-[70px]`} value={draft.penutup ?? ''} onChange={(e) => set({ penutup: e.target.value })} /></Field>
        </Section>
      </div>

      {/* PRATINJAU + EKSPOR (sticky) */}
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <div className="rounded-2xl border border-brand-line bg-brand-paper p-4">
          <p className="mb-2 text-xs font-medium text-brand-muted">Pratinjau langsung (foto pakai placeholder)</p>
          <div className="overflow-hidden rounded-xl border border-brand-line bg-black/5">
            <iframe key={version} ref={iframeRef} src={`/studio/preview?k=${encodeURIComponent(storageKey)}`} title="Pratinjau" className="h-[560px] w-full" />
          </div>
          {mode === 'admin' ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={saveToServer}
                  disabled={saving}
                  className="flex-1 rounded-full bg-brand-ink py-2.5 text-sm font-medium text-brand-cream hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'Menyimpan…' : 'Simpan ke Undangan'}
                </button>
                <button onClick={salin} className="rounded-full border border-brand-gold px-4 py-2.5 text-sm text-brand-ink hover:bg-brand-gold hover:text-white">{copied ? 'Tersalin ✓' : 'Salin JSON'}</button>
              </div>
              {saveMsg && <p className="mt-2 rounded-lg bg-green-600/10 px-3 py-2 text-xs text-green-800">{saveMsg}</p>}
              {saveIssues.length > 0 && (
                <ul className="mt-2 space-y-1 rounded-lg bg-red-600/10 px-3 py-2 text-xs text-red-700">
                  {saveIssues.map((it, i) => <li key={i}>• {it}</li>)}
                </ul>
              )}
              {issues.length > 0 && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-medium">Perlu dilengkapi agar tampil sempurna:</p>
                  <ul className="mt-1 list-inside list-disc">{issues.slice(0, 5).map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-brand-muted">
                Perubahan langsung tersimpan ke undangan. Foto dikelola di bagian “Foto” di atas.
                Isian di luar form (galeri, cerita cinta, dll.) tetap aman &amp; bisa diedit via “JSON mentah”.
              </p>
            </>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={unduh} className="flex-1 rounded-full bg-brand-ink py-2.5 text-sm font-medium text-brand-cream hover:opacity-90">Unduh config.json</button>
                <button onClick={salin} className="rounded-full border border-brand-gold px-4 py-2.5 text-sm text-brand-ink hover:bg-brand-gold hover:text-white">{copied ? 'Tersalin ✓' : 'Salin JSON'}</button>
                <button onClick={reset} className="rounded-full border border-brand-line px-4 py-2.5 text-sm text-brand-muted">Reset</button>
              </div>
              {issues.length > 0 && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-medium">Masih perlu dilengkapi:</p>
                  <ul className="mt-1 list-inside list-disc">{issues.slice(0, 5).map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-brand-muted">
                Setelah selesai, unduh <b>config.json</b> lalu kirim ke admin (atau taruh di
                <code> content/clients/&lt;nama&gt;/</code>). Foto ditambahkan terpisah oleh admin.
              </p>

              {/* Ajukan langsung ke admin (tanpa unduh manual) */}
              <div className="mt-4 rounded-xl border border-brand-gold/50 bg-brand-gold/5 p-4">
                <p className="text-sm font-medium text-brand-ink">Ajukan langsung ke Admin</p>
                <p className="mt-0.5 text-[11px] text-brand-muted">
                  Kirim rancangan Anda + kontak; admin akan menghubungi &amp; menyiapkan undangan.
                </p>
                <div className="mt-3 space-y-2">
                  <input
                    className={inputCls}
                    placeholder="Nama Anda"
                    value={order.nama}
                    onChange={(e) => setOrder((o) => ({ ...o, nama: e.target.value }))}
                    maxLength={80}
                  />
                  <input
                    className={inputCls}
                    placeholder="WhatsApp / email"
                    value={order.kontak}
                    onChange={(e) => setOrder((o) => ({ ...o, kontak: e.target.value }))}
                    maxLength={120}
                  />
                  <select
                    className={inputCls}
                    value={order.paket}
                    onChange={(e) => setOrder((o) => ({ ...o, paket: e.target.value }))}
                  >
                    <option value="">Paket (opsional)</option>
                    <option value="perak">Perak</option>
                    <option value="emas">Emas</option>
                    <option value="platinum">Platinum</option>
                  </select>
                  <button
                    onClick={submitOrder}
                    disabled={orderBusy}
                    className="w-full rounded-full bg-brand-gold py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {orderBusy ? 'Mengirim…' : 'Ajukan ke Admin'}
                  </button>
                  {orderMsg && <p className="text-[11px] text-brand-ink">{orderMsg}</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { Header } from '@/lib/site/Header';
import { StudioEditor } from '@/lib/studio/StudioEditor';

export const metadata: Metadata = {
  title: 'Studio — Buat Undangan Sendiri',
  description: 'Isi data undangan Anda sendiri, lihat pratinjau langsung, lalu ekspor config.json.',
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <p className="font-brand-script text-3xl text-brand-gold">Studio</p>
          <h1 className="mt-1 font-brand-serif text-3xl font-semibold text-brand-ink">Buat Undangan Sendiri</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-brand-muted">
            Isi data di bawah, lihat pratinjau langsung, lalu unduh <b>config.json</b> untuk diserahkan
            ke admin. Draft tersimpan otomatis di browser Anda.
          </p>
        </div>
        <StudioEditor />
      </main>
    </div>
  );
}

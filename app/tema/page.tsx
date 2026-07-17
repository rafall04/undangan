import type { Metadata } from 'next';
import { Header } from '@/lib/site/Header';
import { Footer } from '@/lib/site/Footer';
import { KatalogClient } from '@/lib/catalog/KatalogClient';
import { statistikRegistry } from '@/lib/engine';

const stat = statistikRegistry();

export const metadata: Metadata = {
  title: `Katalog ${stat.totalTema} Tema Undangan`,
  description: `Jelajahi ${stat.totalTema} tema undangan pernikahan digital terkurasi dari Rafayana by RAF Undangan — dari adat tradisional hingga modern minimalis.`,
};

export default function KatalogPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <p className="font-brand-script text-3xl text-brand-gold">Katalog Tema</p>
          <h1 className="mt-1 font-brand-serif text-3xl font-semibold text-brand-ink sm:text-4xl">
            {stat.totalTema} Tema Terkurasi
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-muted sm:text-base">
            Setiap tema dirancang harmonis — perpaduan layout, palet warna, pasangan font, dan motif
            ornamen. Ketuk salah satu untuk melihat demo undangannya.
          </p>
        </div>
        <KatalogClient />
      </main>
      <Footer />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { BRAND } from '@/lib/brand';

// ============================================================================
// Footer brand.
// ============================================================================

export function Footer() {
  return (
    <footer className="border-t border-brand-line bg-brand-ink text-brand-cream">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <Wordmark size="md" tone="light" className="items-start" />
            <p className="mt-3 max-w-xs text-sm text-brand-cream/70">{BRAND.tagline}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-brand-cream/80">
            <Link href="/tema" className="hover:text-white">Katalog Tema</Link>
            <Link href="/#harga" className="hover:text-white">Harga</Link>
            <Link href="/#cara" className="hover:text-white">Cara Pesan</Link>
            <a href={`https://instagram.com/${BRAND.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Instagram @{BRAND.instagram}
            </a>
          </nav>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-brand-cream/60">
          <p>
            © {new Date().getFullYear()} {BRAND.penuh}. Setiap perjalanan cinta layak diabadikan.
          </p>
          <p className="mt-1">{BRAND.domain}</p>
        </div>
      </div>
    </footer>
  );
}

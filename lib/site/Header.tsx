import React from 'react';
import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { waLink } from '@/lib/brand';
import { getSettings } from '@/lib/settings';

// ============================================================================
// Header brand (landing & katalog). Warna gading hangat.
// Nomor WA diambil dari Pengaturan (DB) → admin bisa mengubahnya tanpa deploy.
// ============================================================================

export function Header() {
  const { whatsapp } = getSettings();
  return (
    <header className="sticky top-0 z-40 border-b border-brand-line/70 bg-brand-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Rafayana — Beranda">
          <Wordmark size="sm" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link href="/tema" className="hidden px-2 py-1 text-sm text-brand-ink hover:text-brand-gold sm:block">
            Katalog Tema
          </Link>
          <Link href="/#harga" className="hidden px-2 py-1 text-sm text-brand-ink hover:text-brand-gold sm:block">
            Harga
          </Link>
          <Link href="/#cara" className="hidden px-2 py-1 text-sm text-brand-ink hover:text-brand-gold sm:block">
            Cara Pesan
          </Link>
          <Link href="/studio" className="hidden px-2 py-1 text-sm text-brand-ink hover:text-brand-gold sm:block">
            Studio
          </Link>
          <a
            href={waLink('Halo Rafayana, saya ingin memesan undangan digital.', whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-2 text-sm font-medium text-brand-cream transition-opacity hover:opacity-90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.3.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.5 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .1 0 .7-.1 1.1Z" />
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sm:hidden">Pesan</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import '@/lib/engine/fonts-load'; // self-hosted @fontsource (bukan Google CDN)
import { TEMA_BULAT } from '@/lib/brand';

export const metadata: Metadata = {
  metadataBase: new URL('https://undangan.raf.my.id'),
  title: {
    default: 'Rafayana by RAF Undangan — Undangan Pernikahan Digital',
    template: '%s · Rafayana by RAF Undangan',
  },
  description:
    `Rafayana by RAF Undangan — undangan pernikahan digital elegan. Setiap perjalanan cinta layak diabadikan. ${TEMA_BULAT} tema terkurasi, siap kirim lewat WhatsApp.`,
  keywords: [
    'undangan digital',
    'undangan pernikahan',
    'undangan online',
    'wedding invitation',
    'Rafayana',
    'RAF Undangan',
  ],
  authors: [{ name: 'RAF Undangan' }],
  openGraph: {
    type: 'website',
    siteName: 'Rafayana by RAF Undangan',
    locale: 'id_ID',
    title: 'Rafayana by RAF Undangan — Undangan Pernikahan Digital',
    description: 'Setiap perjalanan cinta layak diabadikan.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

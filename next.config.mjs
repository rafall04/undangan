/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Native module (better-sqlite3) — jangan di-bundle webpack; jalankan dari node_modules.
    serverComponentsExternalPackages: ['better-sqlite3'],
    // Sertakan folder content/ (config & foto klien) dalam output tracing agar
    // dibaca route handler foto & halaman /u/[client] saat deploy (Vercel/Node).
    // (Di Next 14.2 kunci ini berada di bawah `experimental`.)
    outputFileTracingIncludes: {
      '/u/[client]': ['./content/clients/**/*'],
      '/u/[client]/photos/[file]': ['./content/clients/**/*'],
      '/u/[client]/kirim': ['./content/clients/**/*'],
      // Font .woff untuk OG image (dibaca readFileSync saat render).
      '/tema/[slug]/opengraph-image': [
        './node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff',
        './node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff',
      ],
      '/u/[client]/opengraph-image': [
        './node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff',
        './node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff',
        './content/clients/**/*',
      ],
    },
  },
};

export default nextConfig;

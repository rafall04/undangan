import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // --- Warna tema undangan (via CSS variable, di-set per tema) ---
        page: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        // --- Warna identitas brand (landing & katalog) ---
        brand: {
          cream: '#f4ecdd',
          paper: '#fdf9f0',
          ink: '#3a2c1e',
          gold: '#a9791d',
          terracotta: '#b5623f',
          muted: '#7a6a55',
          line: '#e4d7bf',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'cursive'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        // Font tetap untuk brand (landing/katalog)
        'brand-serif': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'brand-script': ['"Pinyon Script"', 'cursive'],
        'brand-sans': ['"Jost"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        invite: '30rem', // lebar undangan terpusat (mobile-first)
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.9s ease-out both',
        floaty: 'floaty 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;

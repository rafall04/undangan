# ============================================================================
# Rafayana — image produksi (opsi paling terisolasi di server bersama).
# Build: docker build -t undangan .
# ============================================================================
FROM node:20-bookworm-slim AS build
WORKDIR /app
# Build deps untuk modul native (better-sqlite3) bila prebuilt tidak tersedia.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
# Build, buang devDeps, lalu pasang ulang sharp KHUSUS linux (lockfile dibuat di
# Windows → binari @img bisa tak cocok). Validasi sharp benar-benar bisa dimuat.
RUN npm run build && npm prune --omit=dev \
    && rm -rf node_modules/sharp node_modules/@img \
    && npm install sharp@0.33.5 --no-save --omit=dev \
    && node -e "require('sharp'); console.log('sharp loads OK')"

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/content ./content
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "start"]

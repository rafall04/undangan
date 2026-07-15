// ============================================================================
// PM2 (opsi tanpa Docker). Jalankan Next di port khusus 3007 (ganti bila
// bentrok). nginx mem-proxy domain → 127.0.0.1:3007.
//   cd /opt/undangan && pm2 start deploy/ecosystem.config.cjs && pm2 save
// ============================================================================
module.exports = {
  apps: [
    {
      name: 'undangan',
      cwd: '/opt/undangan',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3007',
      env: { NODE_ENV: 'production', PORT: '3007' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
};

// apps/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sumarepo/api', '@sumarepo/shared'],
};

module.exports = nextConfig;
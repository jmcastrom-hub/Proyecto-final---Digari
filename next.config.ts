import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['node:sqlite'],
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

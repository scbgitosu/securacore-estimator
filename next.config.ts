import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow embedding in Wix iframes. (X-Frame-Options has no
          // wildcard/ALLOWALL value in the spec — modern browsers ignore
          // such headers — so we rely on CSP frame-ancestors.)
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
        ],
      },
    ];
  },
};

export default nextConfig;

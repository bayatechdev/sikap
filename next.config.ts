import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate unique build ID setiap deploy
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  images: {
    remotePatterns: [
      // Development localhost patterns - support multiple ports
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/images/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      // Production domain patterns
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
        pathname: '/api/files/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/files/:path*',
      },
    ];
  },

  // Set proper cache headers
  async headers() {
    return [
      {
        // Cache static assets dengan hash (immutable)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Jangan cache HTML pages
        source: '/:path((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

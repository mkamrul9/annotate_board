import type { NextConfig } from "next";

const backendHostname = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
  : 'localhost';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Local Django dev server
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        // Render production backend
        protocol: 'https',
        hostname: backendHostname,
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;

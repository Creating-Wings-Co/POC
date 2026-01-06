import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.auth0.com',
      },
      {
        protocol: 'https',
        hostname: '**.auth0usercontent.com',
      },
    ],
  },
  // Ensure proper routing for Amplify
  trailingSlash: false,
};

export default nextConfig;

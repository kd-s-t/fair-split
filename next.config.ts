import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone', // Commented out for dfx compatibility
  
  // Suppress hydration warnings in development
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
      },
    ],
  },
  // Increase timeout for static generation
  staticPageGenerationTimeout: 120,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;

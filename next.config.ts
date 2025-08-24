import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker production builds
  
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

    ],
  },
  // Increase timeout for static generation
  staticPageGenerationTimeout: 120,
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    
    // Development-specific webpack optimizations
    if (dev) {
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
        minimize: false,
      };
      
      // Faster source maps
      config.devtool = 'eval-cheap-module-source-map';
      
      // Disable performance hints in development
      config.performance = {
        ...config.performance,
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      };
    }
    
    return config;
  },
  // Turbopack optimizations for faster development
  experimental: {
    // Enable Turbopack for faster builds
    turbo: {
      // Optimize package imports for faster builds
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-accordion',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'framer-motion',
      'react-hook-form',
      'zod',
      'sonner'
    ],
    
    // Enable webpack build worker for parallel processing
    webpackBuildWorker: true,
  },
};

export default nextConfig;

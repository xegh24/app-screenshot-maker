import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    domains: [
      'localhost',
      'your-project-id.supabase.co',
      'res.cloudinary.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // API configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },

  // Build configuration
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack configuration for canvas and image processing
  webpack: (config, { isServer }) => {
    // Handle canvas for server-side rendering
    if (isServer) {
      config.externals.push('canvas');
    }

    // Handle file imports
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/images/',
          outputPath: 'static/images/',
        },
      },
    });

    return config;
  },

  // Environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/create',
        destination: '/editor',
        permanent: true,
      },
    ];
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/screenshot/:path*',
        destination: '/api/screenshot/:path*',
      },
    ];
  },
};

export default nextConfig;

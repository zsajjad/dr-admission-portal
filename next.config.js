/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_CAPTCHA_BYPASS: process.env.NEXT_PUBLIC_CAPTCHA_BYPASS,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'linv-portal.peekaboo.guru'],
    },
  },
  modularizeImports: {
    '@phosphor-icons/react': {
      transform: '@phosphor-icons/react/dist/{{member}}',
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Handle phosphor-icons
    config.module.rules.push({
      test: /@phosphor-icons[\\/]react/,
      sideEffects: false,
    });

    return config;
  },
};

module.exports = nextConfig;

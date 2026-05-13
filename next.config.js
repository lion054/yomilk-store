// PWA disabled — next-pwa wrapper removed to prevent webpack module factory
// interference during HMR. Re-enable when ready for production PWA support.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode in production (reduces double-renders)
  reactStrictMode: process.env.NODE_ENV === 'development',

  // Enable aggressive image optimization
  images: {
    // Server can't reach yomilk.erpona.com:3330 (firewall) so Next.js image
    // optimization times out. Serve CDN images directly until the ERP firewall
    // whitelists 167.172.179.210 on port 3330.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yomilk.erpona.com',
        port: '3330',
        pathname: '/**',
      },
    ],
  },

  // Enable compression and optimization
  compress: true,
  // Security headers for Next.js dev server
  // For production static export, configure these on your hosting server (nginx/Apache/Cloudflare)
  async headers() {
    // Development mode needs 'unsafe-eval' for Hot Module Replacement (HMR)
    const isDev = process.env.NODE_ENV === 'development';
    const scriptSrc = isDev
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' 'unsafe-inline'";

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              `script-src ${scriptSrc}; ` +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com data:; " +
              "connect-src 'self' https://yomilk.erpona.com:8092; " +
              "img-src 'self' data: https://yomilk.erpona.com:3330; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self'; " +
              "object-src 'none';"
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/about-us',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/contact-us',
        permanent: true,
      },
    ];
  },
  // TypeScript strict mode
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // Experimental: enable optimization of fonts
  experimental: {
    optimizePackageImports: [
      'react-bootstrap', 'reactstrap', 'react-toastify', 'swiper',
      'framer-motion', '@tanstack/react-query', 'bootstrap',
      'rc-slider', 'leaflet', 'react-responsive-modal', 'iron-session',
    ],
  },
};

module.exports = nextConfig;

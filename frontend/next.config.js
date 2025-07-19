/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/market-sentiment/:path*',
        destination: 'http://localhost:5001/api/market-sentiment/:path*',
      },
      {
        source: '/api/portfolio/:path*',
        destination: 'http://localhost:5001/api/portfolio/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5001/api/auth/:path*',
      },
      {
        source: '/api/feedback/:path*',
        destination: 'http://localhost:5001/api/feedback/:path*',
      },
      {
        source: '/api/trades/:path*',
        destination: 'http://localhost:5001/api/trades/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
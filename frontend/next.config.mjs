/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        // Default to localhost for local dev if NEXT_PUBLIC_API_URL is missing.
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

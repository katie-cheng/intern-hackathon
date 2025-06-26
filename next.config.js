/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
    });
    return config;
  },
  // Increase the maximum payload size for video uploads
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg'],
  },
  // Enable static file serving for uploaded videos
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
}

module.exports = nextConfig 
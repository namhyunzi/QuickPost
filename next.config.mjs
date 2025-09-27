/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "connect-src 'self' https://*.asia-southeast1.firebasedatabase.app https://*.googleapis.com wss://*.asia-southeast1.firebasedatabase.app; frame-src 'self' https://*.vercel.app; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app;"
          }
        ]
      }
    ]
  }
}

export default nextConfig

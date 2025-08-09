/** @type {import('next').NextConfig} */
const nextConfig = {
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  // 서버 외부 패키지 설정
  serverExternalPackages: ['@supabase/supabase-js'],
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 압축 설정
  compress: true,
  // 헤더 최적화
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
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // 리다이렉트 최적화
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/doctor',
        permanent: false,
      },
    ]
  },
  // 빌드 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 출력 설정
  output: 'standalone',
}

module.exports = nextConfig

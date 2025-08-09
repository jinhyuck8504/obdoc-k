/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostCSS 완전 비활성화
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // CSS 처리 비활성화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // PostCSS 로더 제거
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.use && Array.isArray(oneOf.use)) {
            oneOf.use = oneOf.use.filter((use) => {
              if (typeof use === 'object' && use.loader) {
                return !use.loader.includes('postcss-loader')
              }
              return true
            })
          }
        })
      }
    })

    return config
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
    ignoreBuildErrors: false,
  },

  // 출력 설정
  output: 'standalone',
}

module.exports = nextConfig

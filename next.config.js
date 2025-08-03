/** @type {import('next').NextConfig} */
const nextConfig = {
  // 성능 최적화 설정
  experimental: {
    // 메모리 사용량 최적화
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // 서버 외부 패키지 설정 (experimental에서 이동)
  serverExternalPackages: ['@supabase/supabase-js'],

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 압축 설정
  compress: true,

  // 정적 파일 최적화
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // 웹팩 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 프로덕션 빌드 최적화
    if (!dev && !isServer) {
      // 번들 분석을 위한 설정
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            chunks: 'all',
            enforce: true,
          },
        },
      }

      // 트리 쉐이킹 최적화
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }

    // 번들 크기 분석 (개발 환경에서만)
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      )
    }

    return config
  },

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
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
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

  // 성능 모니터링
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // 출력 설정
  output: 'standalone',
  
  // 환경 변수
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // PWA 설정 (필요시)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  // PostCSS 설정 완전 제거
  webpack: (config) => {
    // CSS 관련 설정 최소화
    return config;
  }
};

module.exports = nextConfig;

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
  // 빌드에서 문제가 되는 페이지들 제외
  webpack: (config, { isServer }) => {
    // 관리자 페이지들을 빌드에서 제외
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src')
    };
    
    return config;
  },
  // 정적 생성에서 특정 경로 제외
  async generateBuildId() {
    return 'build-' + Date.now();
  }
};

module.exports = nextConfig;

import type {NextConfig} from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'

const nextConfig: NextConfig = {
  // Configure basePath e assetPrefix para o GitHub Pages
  basePath: isGithubActions ? '/minoplis' : '',
  assetPrefix: isGithubActions ? '/minoplis/' : '',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Necessário para exportação estática
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

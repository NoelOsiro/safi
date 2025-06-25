import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "example-nextjs-webpack-bundle",
        uploadToken: process.env.CODECOV_TOKEN,
        webpack: options.webpack,
      }),
    );

    return config;
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@digital-astrology/lib", "@digital-astrology/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

module.exports = nextConfig;

  // Polyfill for Edge Runtime compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        __dirname: false,
      };
    }
    return config;
  },

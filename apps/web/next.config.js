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

  // Polyfill for Edge Runtime
  webpack: (config) => {
    // Set __dirname to undefined for Edge Runtime compatibility
    config.node = {
      ...config.node,
      __dirname: false,
    };
    return config;
  },
    
module.exports = nextConfig;


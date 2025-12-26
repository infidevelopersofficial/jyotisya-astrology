/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@digital-astrology/lib", "@digital-astrology/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Suppress webpack warnings from Sentry's OpenTelemetry integration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress noisy warnings from OpenTelemetry and require-in-the-middle
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        // Ignore OpenTelemetry dynamic import warnings
        { module: /node_modules\/@opentelemetry\/instrumentation/ },
        { module: /node_modules\/require-in-the-middle/ },
        { module: /node_modules\/import-in-the-middle/ },
        // Catch-all pattern for critical dependency warnings
        /critical dependency:/i,
      ];
    }

    return config;
  },
};

module.exports = nextConfig;

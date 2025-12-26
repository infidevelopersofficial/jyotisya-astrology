import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest Configuration for Digital Astrology Monorepo
 *
 * This is the root-level configuration that provides shared settings
 * for all workspace packages. Individual apps can extend this config
 * with their own vitest.config.ts files.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".next/",
        "coverage/",
        "**/*.config.{js,ts}",
        "**/tests/**",
        "**/*.test.{js,ts,tsx}",
        "**/*.spec.{js,ts,tsx}",
      ],
    },
    include: [
      "**/__tests__/**/*.{test,spec}.{js,ts,tsx}",
      "**/tests/**/*.{test,spec}.{js,ts,tsx}",
      "**/*.{test,spec}.{js,ts,tsx}",
    ],
    exclude: ["node_modules", "dist", ".next", "build", "coverage"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

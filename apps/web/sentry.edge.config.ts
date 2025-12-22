/**
 * Sentry Edge Runtime Configuration
 *
 * IMPORTANT: We do NOT initialize Sentry in Edge Runtime (middleware) because:
 * 1. @sentry/nextjs contains Node.js-specific code (uses __dirname, fs, path, etc.)
 * 2. Even with minimal config, importing @sentry/nextjs causes Node.js modules to be bundled
 * 3. Edge Runtime only supports Web Standard APIs, not Node.js APIs
 *
 * Alternative approaches:
 * - Middleware errors will still be captured by server-side Sentry after they propagate
 * - You can use console.error() in middleware which Vercel logs automatically
 * - For critical edge errors, use try/catch and log with console.error()
 *
 * If you absolutely need Sentry in Edge Runtime:
 * - Use @sentry/core or @sentry/browser (NOT @sentry/nextjs)
 * - Manually configure with only edge-compatible integrations
 * - Test thoroughly to ensure no Node.js globals are accessed
 */

// Intentionally empty - no Sentry initialization for Edge Runtime
// This prevents __dirname and other Node.js global errors

console.info('[Sentry Edge] Sentry is disabled for Edge Runtime (middleware) to prevent Node.js compatibility issues')

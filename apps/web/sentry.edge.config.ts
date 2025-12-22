// Direct Sentry initialization for Edge Runtime (middleware)
// This file does NOT import from lib/monitoring/sentry.ts to avoid bundling Node.js-specific code
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Edge Runtime: Minimal configuration without Node.js or browser-specific features
    // No integrations, no session replay, no Node.js-specific features
    integrations: [],

    // Error filtering - keep minimal for edge
    beforeSend(event) {
      // Only filter critical edge-specific errors if needed
      return event
    },

    // Ignore common errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'cancelled',
    ],
  })
} else {
  console.warn('[Sentry Edge] DSN not configured, error tracking disabled')
}

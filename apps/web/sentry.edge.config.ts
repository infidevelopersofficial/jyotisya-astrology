import { initSentry } from './lib/monitoring/sentry'

// Initialize Sentry for Edge Runtime (middleware)
// Uses minimal configuration without Node.js or browser-specific features
initSentry('edge')

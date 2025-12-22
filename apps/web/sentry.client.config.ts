import { initSentry } from './lib/monitoring/sentry'

// Initialize Sentry for browser (client-side)
// Includes session replay and browser-specific features
initSentry('client')

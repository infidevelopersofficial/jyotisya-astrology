import { initSentry } from "./lib/monitoring/sentry";

// Initialize Sentry for Node.js server (SSR, API routes)
// Uses standard server-side configuration
initSentry("server");

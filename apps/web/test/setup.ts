import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Setup before all tests
beforeAll(() => {
  // Mock environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JYOTISH_API_URL = "https://api.test.com";
  process.env.JYOTISH_API_KEY = "test-api-key";
});

// Mock Supabase SSR globally - use a factory function to avoid circular dependencies
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => {
    // Lazy-load the mock to avoid circular dependency issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { createMockSupabaseClient } = require("./mocks/supabase");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return createMockSupabaseClient();
  }),
  createServerClient: vi.fn(() => {
    // Lazy-load the mock to avoid circular dependency issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const { createMockSupabaseClient } = require("./mocks/supabase");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return createMockSupabaseClient();
  }),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  vi.restoreAllMocks();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/",
    query: {},
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // Return a mock img element using createElement to avoid JSX in .ts file
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const React = require("react");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return React.createElement("img", props);
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock ResizeObserver
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Suppress console errors in tests (optional)
if (process.env.SUPPRESS_CONSOLE_ERRORS === "true") {
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
}

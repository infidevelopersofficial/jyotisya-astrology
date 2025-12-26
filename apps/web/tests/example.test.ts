import { describe, it, expect } from "vitest";

/**
 * Example test suite for @digital-astrology/web
 *
 * This is a basic test to verify Vitest is working correctly.
 * Replace with actual tests for your application.
 */
describe("Web App - Basic Tests", () => {
  it("should pass a simple assertion", () => {
    expect(true).toBe(true);
  });

  it("should perform basic arithmetic", () => {
    expect(2 + 2).toBe(4);
  });

  it("should handle string operations", () => {
    const appName = "Digital Astrology";
    expect(appName).toContain("Astrology");
    expect(appName.toLowerCase()).toBe("digital astrology");
  });

  it("should work with arrays", () => {
    const zodiacSigns = ["Aries", "Taurus", "Gemini"];
    expect(zodiacSigns).toHaveLength(3);
    expect(zodiacSigns).toContain("Aries");
  });

  it("should work with objects", () => {
    const user = {
      name: "Test User",
      sunSign: "Leo",
      onboardingCompleted: false,
    };
    expect(user).toHaveProperty("sunSign");
    expect(user.sunSign).toBe("Leo");
  });
});

describe("Web App - Environment", () => {
  it("should have NODE_ENV defined", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it("should be running in test environment", () => {
    // Vitest sets NODE_ENV to 'test' by default
    expect(process.env.NODE_ENV).toBe("test");
  });
});

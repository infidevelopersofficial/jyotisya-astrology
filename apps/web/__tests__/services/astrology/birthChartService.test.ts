/**
 * Tests for birthChartService
 */

import { describe, it, expect } from "vitest";
import {
  getDisplayChartName,
  buildDownloadFilename,
  getFullChartName,
  getSignName,
  formatDegree,
  validateBirthData,
  isRetrograde,
  getFormattedBirthDateTime,
  getSunSignFromDate,
  DIVISIONAL_CHARTS,
} from "@/services/astrology/birthChartService";
import type { BirthData } from "@/types/astrology/birthChart.types";

describe("birthChartService", () => {
  describe("getDisplayChartName", () => {
    it("should return custom name when provided", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "Roopesh Singh",
      };

      const result = getDisplayChartName(birthData, false);
      expect(result).toBe("Roopesh Singh");
    });

    it("should return custom name with chart type suffix when includeChartType is true", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "Roopesh Singh",
      };

      const result = getDisplayChartName(birthData, true);
      expect(result).toBe("Roopesh Singh – Birth Chart");
    });

    it("should return date-based name when chartName is empty", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "",
      };

      const result = getDisplayChartName(birthData, false);
      expect(result).toBe("Birth Chart – 15 Jan 2025");
    });

    it("should return date-based name when chartName is whitespace only", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "   ",
      };

      const result = getDisplayChartName(birthData, false);
      expect(result).toBe("Birth Chart – 15 Jan 2025");
    });

    it('should return "Birth Chart" when no dateTime is provided', () => {
      const birthData: BirthData = {
        dateTime: "",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "",
      };

      const result = getDisplayChartName(birthData, false);
      expect(result).toBe("Birth Chart");
    });

    it("should trim whitespace from custom chart name", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "  My Chart  ",
      };

      const result = getDisplayChartName(birthData, false);
      expect(result).toBe("My Chart");
    });
  });

  describe("buildDownloadFilename", () => {
    it("should build filename with custom chart name", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "Roopesh Singh",
      };

      const result = buildDownloadFilename(birthData, "D9", "png");

      // Should contain sanitized name, divisional code, and extension
      expect(result).toMatch(/^roopesh-singh-d9-\d+\.png$/);
    });

    it("should build filename with date when no custom name", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "",
      };

      const result = buildDownloadFilename(birthData, "D1", "pdf");

      expect(result).toMatch(/^birth-chart-15-01-2025-d1-\d+\.pdf$/);
    });

    it("should sanitize special characters in custom name", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "Ram's Chart!",
      };

      const result = buildDownloadFilename(birthData, "D10", "png");

      expect(result).toMatch(/^rams-chart-d10-\d+\.png$/);
    });

    it("should lowercase divisional code", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "Test",
      };

      const result = buildDownloadFilename(birthData, "D9", "png");

      expect(result).toContain("-d9-");
    });
  });

  describe("getFullChartName", () => {
    it("should return display name only for D1 chart", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "My Chart",
      };

      const result = getFullChartName(birthData, "D1", DIVISIONAL_CHARTS);
      expect(result).toBe("My Chart");
    });

    it("should include divisional chart name for non-D1 charts", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "My Chart",
      };

      const result = getFullChartName(birthData, "D9", DIVISIONAL_CHARTS);
      expect(result).toBe("My Chart – Marriage");
    });

    it("should handle unknown divisional chart codes", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "My Chart",
      };

      const result = getFullChartName(birthData, "D99", DIVISIONAL_CHARTS);
      expect(result).toBe("My Chart – Birth Chart");
    });
  });

  describe("getSignName", () => {
    it("should return correct sign for number 1", () => {
      expect(getSignName(1)).toBe("Aries");
    });

    it("should return correct sign for number 6", () => {
      expect(getSignName(6)).toBe("Virgo");
    });

    it("should return correct sign for number 12", () => {
      expect(getSignName(12)).toBe("Pisces");
    });

    it("should handle numbers > 12 with modulo", () => {
      expect(getSignName(13)).toBe("Aries");
      expect(getSignName(25)).toBe("Aries");
    });

    it("should return Unknown for invalid numbers", () => {
      expect(getSignName(0)).toBe("Unknown");
      expect(getSignName(-1)).toBe("Unknown");
    });
  });

  describe("formatDegree", () => {
    it("should format 23.75 degrees correctly", () => {
      expect(formatDegree(23.75)).toBe("23° 45'");
    });

    it("should format 0 degrees", () => {
      expect(formatDegree(0)).toBe("0° 0'");
    });

    it("should format 29.99 degrees", () => {
      expect(formatDegree(29.99)).toBe("29° 59'");
    });

    it("should handle whole numbers", () => {
      expect(formatDegree(15)).toBe("15° 0'");
    });
  });

  describe("validateBirthData", () => {
    it("should validate correct birth data", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "",
      };

      const result = validateBirthData(birthData);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail when dateTime is missing", () => {
      const birthData: BirthData = {
        dateTime: "",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "Delhi, India",
        chartName: "",
      };

      const result = validateBirthData(birthData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Please select your birth date and time to continue");
    });

    it("should fail when location is missing", () => {
      const birthData: BirthData = {
        dateTime: "2025-01-15T10:30:00",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 5.5,
        location: "",
        chartName: "",
      };

      const result = validateBirthData(birthData);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Please select your birth location");
    });
  });

  describe("isRetrograde", () => {
    it("should return true for boolean true", () => {
      expect(isRetrograde(true)).toBe(true);
    });

    it('should return true for string "true"', () => {
      expect(isRetrograde("true")).toBe(true);
    });

    it("should return false for boolean false", () => {
      expect(isRetrograde(false)).toBe(false);
    });

    it('should return false for string "false"', () => {
      expect(isRetrograde("false")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isRetrograde("")).toBe(false);
    });
  });

  describe("getFormattedBirthDateTime", () => {
    it("should format date and time correctly", () => {
      const result = getFormattedBirthDateTime("2025-01-15T10:30:00");

      expect(result.date).toBe("15 January 2025");
      expect(result.time).toMatch(/10:30/);
      expect(result.full).toContain("15 January 2025");
      expect(result.full).toContain("at");
    });
  });

  describe("getSunSignFromDate", () => {
    it("should return Aries for March 21", () => {
      const date = new Date("2025-03-21");
      expect(getSunSignFromDate(date)).toBe("Aries");
    });

    it("should return Scorpio for October 23", () => {
      const date = new Date("2025-10-23");
      expect(getSunSignFromDate(date)).toBe("Scorpio");
    });

    it("should return Pisces for February 19", () => {
      const date = new Date("2025-02-19");
      expect(getSunSignFromDate(date)).toBe("Pisces");
    });

    it("should return Capricorn for December 22", () => {
      const date = new Date("2025-12-22");
      expect(getSunSignFromDate(date)).toBe("Capricorn");
    });
  });

  describe("DIVISIONAL_CHARTS", () => {
    it("should have correct D1 chart definition", () => {
      const d1 = DIVISIONAL_CHARTS.find((c) => c.code === "D1");
      expect(d1).toBeDefined();
      expect(d1?.name).toBe("Birth Chart");
      expect(d1?.beginner).toBe(true);
    });

    it("should have 8 divisional charts", () => {
      expect(DIVISIONAL_CHARTS).toHaveLength(8);
    });

    it("should have 3 beginner charts", () => {
      const beginnerCharts = DIVISIONAL_CHARTS.filter((c) => c.beginner);
      expect(beginnerCharts).toHaveLength(3);
    });
  });
});

/**
 * Vedic Math Utilities
 * 
 * Common utility functions for Vedic astrology calculations.
 */

// Rashi lords mapping (1-12)
export const RASHI_LORDS: Record<number, string> = {
  1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon",
  5: "Sun", 6: "Mercury", 7: "Venus", 8: "Mars",
  9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

// Exaltation signs
export const EXALTATION: Record<string, number> = {
  Sun: 1, Moon: 2, Mars: 10, Mercury: 6,
  Jupiter: 4, Venus: 12, Saturn: 7
};

// Debilitation signs
export const DEBILITATION: Record<string, number> = {
  Sun: 7, Moon: 8, Mars: 4, Mercury: 12,
  Jupiter: 10, Venus: 6, Saturn: 1
};

// Kendra houses (angular)
export const KENDRAS = [1, 4, 7, 10];

// Trikona houses (trinal)
export const TRIKONAS = [1, 5, 9];

// Dusthanas (malefic houses)
export const DUSTHANAS = [6, 8, 12];

// Natural benefics and malefics
export const BENEFICS = ["Jupiter", "Venus", "Moon", "Mercury"];
export const MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

// Sign names
export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

/**
 * Get rashi number (1-12) from longitude
 */
export function getRashiFromLongitude(longitude: number): number {
  return Math.floor(longitude / 30) + 1;
}

/**
 * Get sign name from rashi number
 */
export function getSignName(rashi: number): string {
  return SIGN_NAMES[(rashi - 1) % 12] ?? "Unknown";
}

/**
 * Get house number (1-12) from planet and ascendant longitude
 */
export function getHouseFromLongitude(planetLon: number, ascLon: number): number {
  const diff = (planetLon - ascLon + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

/**
 * Check if planet is in exaltation sign
 */
export function isExalted(planet: string, rashi: number): boolean {
  return EXALTATION[planet] === rashi;
}

/**
 * Check if planet is in debilitation sign
 */
export function isDebilitated(planet: string, rashi: number): boolean {
  return DEBILITATION[planet] === rashi;
}

/**
 * Get lord of a rashi
 */
export function getRashiLord(rashi: number): string {
  return RASHI_LORDS[((rashi - 1) % 12) + 1] ?? "Unknown";
}

/**
 * Check if a house is a kendra
 */
export function isKendra(house: number): boolean {
  return KENDRAS.includes(house);
}

/**
 * Check if a house is a trikona
 */
export function isTrikona(house: number): boolean {
  return TRIKONAS.includes(house);
}

/**
 * Get approximate Lahiri ayanamsha for a given year
 */
export function getLahiriAyanamsha(year: number): number {
  // Lahiri ayanamsha is approximately 23°51' on Jan 1, 1950
  // and increases by about 50.3" per year
  const baseYear = 1950;
  const baseValue = 23.85; // 23°51'
  const yearlyRate = 50.3 / 3600; // Convert arc-seconds to degrees
  
  return baseValue + (year - baseYear) * yearlyRate;
}

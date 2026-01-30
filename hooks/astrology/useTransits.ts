/**
 * Hook for Transit Predictions
 */

import { useState, useCallback } from "react";

interface Transit {
  transitPlanet: string;
  transitLongitude: number;
  natalPlanet: string;
  natalLongitude: number;
  aspect: string;
  nature: "harmonious" | "challenging" | "intense";
  exactness: number;
  orb: number;
  effect: string;
  significance: "critical" | "major" | "notable" | "minor";
  significations: string[];
}

interface TransitSummary {
  totalAspects: number;
  majorTransits: number;
  challengingCount: number;
  harmoniousCount: number;
  overallTone: "favorable" | "challenging" | "mixed";
  interpretation: string;
}

interface TransitResult {
  transitTime: string;
  currentPositions: Record<string, number>;
  activeTransits: Transit[];
  summary: TransitSummary;
  natalData?: {
    birthDate: string;
    planets: Record<string, number>;
  };
  source: string;
}

interface TransitOptions {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds?: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

interface UseTransitsReturn {
  transits: TransitResult | null;
  loading: boolean;
  error: string | null;
  fetchTransits: (options: TransitOptions) => Promise<void>;
}

// Aspect symbols for UI
export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌",
  opposition: "☍",
  trine: "△",
  square: "□",
  sextile: "⚹",
};

// Aspect colors
export const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#9333ea", // purple
  opposition: "#ef4444", // red
  trine: "#22c55e", // green
  square: "#f97316", // orange
  sextile: "#3b82f6", // blue
};

// Nature colors
export const NATURE_COLORS: Record<string, string> = {
  harmonious: "#22c55e",
  challenging: "#ef4444",
  intense: "#a855f7",
};

// Significance badges
export const SIGNIFICANCE_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-500/20", text: "text-red-400" },
  major: { bg: "bg-orange-500/20", text: "text-orange-400" },
  notable: { bg: "bg-blue-500/20", text: "text-blue-400" },
  minor: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

// Tone styles
export const TONE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  favorable: { bg: "from-green-500/20 to-emerald-500/20", text: "text-green-400", icon: "✨" },
  challenging: { bg: "from-red-500/20 to-orange-500/20", text: "text-red-400", icon: "⚡" },
  mixed: { bg: "from-purple-500/20 to-blue-500/20", text: "text-purple-400", icon: "🔄" },
};

export function useTransits(): UseTransitsReturn {
  const [transits, setTransits] = useState<TransitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransits = useCallback(async (options: TransitOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrology/transits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch transits");
      }

      const data: TransitResult = await response.json();
      setTransits(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useTransits] Error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { transits, loading, error, fetchTransits };
}

/**
 * Format aspect for display
 */
export function formatAspect(aspect: string): string {
  const symbol = ASPECT_SYMBOLS[aspect] || "•";
  return `${symbol} ${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`;
}

/**
 * Group transits by significance
 */
export function groupTransitsBySignificance(transits: Transit[]): Record<string, Transit[]> {
  return transits.reduce((acc, t) => {
    const sig = t.significance;
    if (!acc[sig]) acc[sig] = [];
    acc[sig].push(t);
    return acc;
  }, {} as Record<string, Transit[]>);
}

/**
 * Filter major transits
 */
export function getMajorTransits(transits: Transit[]): Transit[] {
  return transits.filter(t => t.significance === "critical" || t.significance === "major");
}

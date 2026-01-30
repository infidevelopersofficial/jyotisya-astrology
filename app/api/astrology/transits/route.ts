import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";

const ASTRO_CORE_URL = process.env.ASTRO_CORE_URL || "https://jyotishya-astro-api.vercel.app";

/**
 * POST /api/astrology/transits
 *
 * Calculate transit effects from birth details
 */

interface TransitRequestBody {
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

function isTransitRequestBody(body: unknown): body is TransitRequestBody {
  if (typeof body !== "object" || body === null) return false;

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.year === "number" &&
    typeof candidate.month === "number" &&
    typeof candidate.date === "number" &&
    typeof candidate.hours === "number" &&
    typeof candidate.minutes === "number" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.timezone === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isTransitRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["year", "month", "date", "hours", "minutes", "latitude", "longitude", "timezone"],
        },
        { status: 400 },
      );
    }

    const response = await fetch(`${ASTRO_CORE_URL}/transits/birth-chart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: body.year,
        month: body.month,
        date: body.date,
        hours: body.hours,
        minutes: body.minutes,
        seconds: body.seconds || 0,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Astro Core Transits API error", { status: response.status, error: errorText });
      return NextResponse.json(
        { error: "Failed to calculate transits", details: errorText },
        { status: 502 },
      );
    }

    const result = await response.json();

    // Transform to camelCase
    return NextResponse.json({
      transitTime: result.transit_time,
      currentPositions: result.current_positions,
      activeTransits: result.active_transits.map((t: Record<string, unknown>) => ({
        transitPlanet: t.transit_planet,
        transitLongitude: t.transit_longitude,
        natalPlanet: t.natal_planet,
        natalLongitude: t.natal_longitude,
        aspect: t.aspect,
        nature: t.nature,
        exactness: t.exactness,
        orb: t.orb,
        effect: t.effect,
        significance: t.significance,
        significations: t.significations,
      })),
      summary: {
        totalAspects: result.summary.total_aspects,
        majorTransits: result.summary.major_transits,
        challengingCount: result.summary.challenging_count,
        harmoniousCount: result.summary.harmonious_count,
        overallTone: result.summary.overall_tone,
        interpretation: result.summary.interpretation,
      },
      natalData: result.natal_data ? {
        birthDate: result.natal_data.birth_date,
        planets: result.natal_data.planets,
      } : null,
      source: "astro_core",
    });
  } catch (error: unknown) {
    logger.error("Transits API error", error);

    return NextResponse.json(
      {
        error: "Failed to calculate transits",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/astrology/transits
 * 
 * Get current planetary positions
 */
export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${ASTRO_CORE_URL}/transits/current`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get current transits" },
        { status: 502 },
      );
    }

    const result = await response.json();

    return NextResponse.json({
      timestamp: result.timestamp,
      positions: result.positions,
      ayanamsha: result.ayanamsha,
      source: "astro_core",
    });
  } catch (error: unknown) {
    logger.error("Current transits API error", error);

    return NextResponse.json(
      { error: "Failed to get current transits" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";

const ASTRO_CORE_URL = process.env.ASTRO_CORE_URL || "https://jyotishya-astro-api.vercel.app";

/**
 * POST /api/astrology/vimsottari-dasha
 *
 * Calculate Vimsottari Dasha periods from the Astro Core API
 *
 * Body:
 * {
 *   "dateTime": "1990-05-15T10:30:00",
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5,
 *   "yearsToCalculate": 100
 * }
 */

interface DashaRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  yearsToCalculate?: number;
}

function isDashaRequestBody(body: unknown): body is DashaRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.dateTime === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.timezone === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isDashaRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["dateTime", "latitude", "longitude", "timezone"],
          optional: ["yearsToCalculate"],
        },
        { status: 400 },
      );
    }

    const { dateTime, latitude, longitude, timezone, yearsToCalculate } = body;

    // Parse datetime
    const dt = new Date(dateTime);

    // Build request for Astro Core API
    const astroCoreRequest = {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      date: dt.getDate(),
      hours: dt.getHours(),
      minutes: dt.getMinutes(),
      seconds: dt.getSeconds(),
      latitude,
      longitude,
      timezone,
      ayanamsha: "lahiri",
      years_to_calculate: yearsToCalculate || 100,
    };

    // Call Astro Core API
    const response = await fetch(`${ASTRO_CORE_URL}/vimsottari-dasha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(astroCoreRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Astro Core Dasha API error", { status: response.status, error: errorText });
      return NextResponse.json(
        { error: "Failed to calculate Dasha", details: errorText },
        { status: 502 },
      );
    }

    const result = await response.json();

    return NextResponse.json({
      birthNakshatra: result.birth_nakshatra,
      nakshatraLord: result.nakshatra_lord,
      moonLongitude: result.moon_longitude,
      currentMahadasha: result.current_mahadasha,
      currentAntardasha: result.current_antardasha,
      mahadashas: result.mahadashas,
      ayanamsha: result.ayanamsha,
      ayanamshaValue: result.ayanamsha_value,
      source: "astro_core",
    });
  } catch (error: unknown) {
    logger.error("Dasha API error", error);

    return NextResponse.json(
      {
        error: "Failed to calculate Dasha",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

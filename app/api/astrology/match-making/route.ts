import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";

const ASTRO_CORE_URL = process.env.ASTRO_CORE_URL || "https://jyotishya-astro-api.vercel.app";

/**
 * POST /api/astrology/match-making
 *
 * Calculate Ashtakoot compatibility from Moon longitudes
 *
 * Body:
 * {
 *   "brideMoonLongitude": 280.5,
 *   "groomMoonLongitude": 115.3,
 *   "brideName": "Priya",
 *   "groomName": "Rahul"
 * }
 */

interface MatchingRequestBody {
  brideMoonLongitude: number;
  groomMoonLongitude: number;
  brideName?: string;
  groomName?: string;
}

function isMatchingRequestBody(body: unknown): body is MatchingRequestBody {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.brideMoonLongitude === "number" &&
    typeof candidate.groomMoonLongitude === "number"
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isMatchingRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: ["brideMoonLongitude", "groomMoonLongitude"],
          optional: ["brideName", "groomName"],
        },
        { status: 400 },
      );
    }

    const { brideMoonLongitude, groomMoonLongitude, brideName, groomName } = body;

    // Build request for Astro Core API
    const astroCoreRequest = {
      bride_moon_longitude: brideMoonLongitude,
      groom_moon_longitude: groomMoonLongitude,
      bride_name: brideName || "Bride",
      groom_name: groomName || "Groom",
    };

    // Call Astro Core API
    const response = await fetch(`${ASTRO_CORE_URL}/match-making`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(astroCoreRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Astro Core Match-making API error", { status: response.status, error: errorText });
      return NextResponse.json(
        { error: "Failed to calculate match", details: errorText },
        { status: 502 },
      );
    }

    const result = await response.json();

    // Transform response to camelCase for frontend
    return NextResponse.json({
      bride: {
        name: result.bride.name,
        nakshatra: result.bride.nakshatra,
        nakshatraNumber: result.bride.nakshatra_number,
        rashi: result.bride.rashi,
        rashiNumber: result.bride.rashi_number,
        moonLongitude: result.bride.moon_longitude,
      },
      groom: {
        name: result.groom.name,
        nakshatra: result.groom.nakshatra,
        nakshatraNumber: result.groom.nakshatra_number,
        rashi: result.groom.rashi,
        rashiNumber: result.groom.rashi_number,
        moonLongitude: result.groom.moon_longitude,
      },
      koots: result.koots.map((k: Record<string, unknown>) => ({
        name: k.name,
        score: k.score,
        maxScore: k.max_score,
        description: k.description,
        brideValue: k.bride_value,
        groomValue: k.groom_value,
      })),
      totalScore: result.total_score,
      maxScore: result.max_score,
      percentage: result.percentage,
      verdict: result.verdict,
      recommendation: result.recommendation,
      source: "astro_core",
    });
  } catch (error: unknown) {
    logger.error("Match-making API error", error);

    return NextResponse.json(
      {
        error: "Failed to calculate match",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { logger } from "@/lib/monitoring/logger";

/**
 * POST /api/astrology/divisional-charts
 *
 * Calculate Divisional Charts from birth details
 */

const PYTHON_SERVICE_URL = process.env.ASTRO_PYTHON_SERVICE_URL || "http://localhost:4001";

interface DivisionalRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  chart?: string; // Optional: specific chart like "D9", "D10"
}

function isValidRequest(body: unknown): body is DivisionalRequestBody {
  if (typeof body !== "object" || body === null) return false;
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

    if (!isValidRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body", required: ["dateTime", "latitude", "longitude", "timezone"] },
        { status: 400 }
      );
    }

    const { dateTime, latitude, longitude, timezone, chart } = body;
    const dt = new Date(dateTime);

    // Build payload for Python backend
    const payload = {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      date: dt.getDate(),
      hours: dt.getHours(),
      minutes: dt.getMinutes(),
      seconds: dt.getSeconds(),
      latitude,
      longitude,
      timezone,
      chart, // Optional specific chart
    };

    logger.info("Fetching divisional charts from Python service", { payload });

    const response = await fetch(`${PYTHON_SERVICE_URL}/divisional-charts/birth-chart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Python divisional charts API error", { status: response.status, error: errorText });
      throw new Error(`Python service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    logger.error("Divisional charts API error", error);
    return NextResponse.json(
      { error: "Failed to fetch divisional charts", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

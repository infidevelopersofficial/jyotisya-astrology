import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/monitoring/logger";
import { rateLimiters } from "@/lib/rate-limit";
import { cache } from "@/lib/api/cache";
import {
  detectYogas,
  buildPlanetDataFromChart,
} from "@/lib/astrology/calculations/YogaDetector";
import type { YogaDetectionResult } from "@/lib/astrology/calculations/YogaDetector";
import { getRashiFromLongitude } from "@/lib/astrology/calculations/VedicMath";

// Cache TTL: 24 hours (deterministic calculation)
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

/**
 * POST /api/astrology/yogas
 *
 * Detect Yogas (planetary combinations) using local TypeScript calculation.
 * No external HTTP dependencies - fully self-hosted.
 */

interface PlanetInput {
  name: string;
  fullDegree: number;
  house?: number;
}

interface YogasRequestBody {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ascendant?: number;
  planets?: PlanetInput[];
}

// Validation constants
const MIN_LAT = -90;
const MAX_LAT = 90;
const MIN_LON = -180;
const MAX_LON = 180;
const MIN_TZ = -12;
const MAX_TZ = 14;
const MIN_DEGREE = 0;
const MAX_DEGREE = 360;
const MIN_BIRTH_YEAR = 1800;
const MAX_BIRTH_YEAR = 2200;
const VALID_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

function validatePlanets(planets: unknown): planets is PlanetInput[] {
  if (!Array.isArray(planets)) return false;
  
  for (const planet of planets) {
    if (typeof planet !== "object" || planet === null) return false;
    const p = planet as Record<string, unknown>;
    if (typeof p.name !== "string" || !VALID_PLANETS.includes(p.name)) return false;
    if (typeof p.fullDegree !== "number" || p.fullDegree < MIN_DEGREE || p.fullDegree > MAX_DEGREE) return false;
    if (p.house !== undefined && (typeof p.house !== "number" || p.house < 1 || p.house > 12)) return false;
  }
  return true;
}

function validateRequest(body: unknown): { valid: true; data: YogasRequestBody } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be an object" };
  }

  const candidate = body as Record<string, unknown>;

  // Required fields
  if (typeof candidate.dateTime !== "string") {
    return { valid: false, error: "dateTime must be a string" };
  }
  if (typeof candidate.latitude !== "number" || isNaN(candidate.latitude)) {
    return { valid: false, error: "latitude must be a valid number" };
  }
  if (typeof candidate.longitude !== "number" || isNaN(candidate.longitude)) {
    return { valid: false, error: "longitude must be a valid number" };
  }
  if (typeof candidate.timezone !== "number" || isNaN(candidate.timezone)) {
    return { valid: false, error: "timezone must be a valid number" };
  }

  // Range validation
  if (candidate.latitude < MIN_LAT || candidate.latitude > MAX_LAT) {
    return { valid: false, error: `latitude must be between ${MIN_LAT} and ${MAX_LAT}` };
  }
  if (candidate.longitude < MIN_LON || candidate.longitude > MAX_LON) {
    return { valid: false, error: `longitude must be between ${MIN_LON} and ${MAX_LON}` };
  }
  if (candidate.timezone < MIN_TZ || candidate.timezone > MAX_TZ) {
    return { valid: false, error: `timezone must be between ${MIN_TZ} and ${MAX_TZ}` };
  }

  // Date validation
  const birthDate = new Date(candidate.dateTime);
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: "Invalid dateTime format. Use ISO 8601 format." };
  }
  const year = birthDate.getFullYear();
  if (year < MIN_BIRTH_YEAR || year > MAX_BIRTH_YEAR) {
    return { valid: false, error: `Birth year must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}` };
  }

  // Optional ascendant validation
  if (candidate.ascendant !== undefined) {
    if (typeof candidate.ascendant !== "number" || isNaN(candidate.ascendant)) {
      return { valid: false, error: "ascendant must be a number" };
    }
    if (candidate.ascendant < MIN_DEGREE || candidate.ascendant >= MAX_DEGREE) {
      return { valid: false, error: `ascendant must be between ${MIN_DEGREE} and ${MAX_DEGREE}` };
    }
  }

  // Optional planets validation
  if (candidate.planets !== undefined) {
    if (!validatePlanets(candidate.planets)) {
      return { valid: false, error: "planets must be an array of {name, fullDegree, house?}" };
    }
  }

  return {
    valid: true,
    data: {
      dateTime: candidate.dateTime,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      timezone: candidate.timezone,
      ascendant: candidate.ascendant as number | undefined,
      planets: candidate.planets as PlanetInput[] | undefined,
    },
  };
}

/**
 * Generate approximate planet positions based on date
 * Note: For accurate yoga detection, pass actual chart data
 */
function generateApproximatePlanets(birthDate: Date): PlanetInput[] {
  const dayOfYear = Math.floor(
    (birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const year = birthDate.getFullYear();

  // Approximate daily motion rates (degrees per day)
  const motionRates: Record<string, number> = {
    Sun: 0.9856,
    Moon: 13.176,
    Mars: 0.524,
    Mercury: 4.09,
    Jupiter: 0.083,
    Venus: 1.602,
    Saturn: 0.033,
    Rahu: -0.053,
    Ketu: -0.053,
  };

  // Reference positions (approximate for J2000)
  const refPositions: Record<string, number> = {
    Sun: 280,
    Moon: 0,
    Mars: 355,
    Mercury: 250,
    Jupiter: 35,
    Venus: 180,
    Saturn: 45,
    Rahu: 150,
    Ketu: 330,
  };

  return VALID_PLANETS.map((name) => {
    const rate = motionRates[name] ?? 1;
    const ref = refPositions[name] ?? 0;
    const yearOffset = (year - 2000) * rate * 365.25;
    const dayOffset = dayOfYear * rate;
    const degree = ((ref + yearOffset + dayOffset) % 360 + 360) % 360;

    return {
      name,
      fullDegree: Math.round(degree * 100) / 100,
    };
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = performance.now();

  // Rate limiting check
  const rateLimitResponse = await rateLimiters.astrology(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Parse JSON with error handling
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: validation.error,
          required: ["dateTime", "latitude", "longitude", "timezone"],
          optional: ["ascendant", "planets"],
        },
        { status: 400 }
      );
    }

    const { dateTime, ascendant, planets } = validation.data;
    const birthDate = new Date(dateTime);

    const hasPreCalculatedData = !!planets && !!ascendant;

    // Use provided data or generate approximate positions
    const chartPlanets = planets ?? generateApproximatePlanets(birthDate);
    const ascendantDegree = ascendant ?? 
      (Math.abs(birthDate.getHours() * 30 + birthDate.getMinutes() * 0.5) % 360);
    const ascendantRashi = getRashiFromLongitude(ascendantDegree);

    // Generate cache key (based on ascendant and birth date)
    const cacheKey = `astro:yogas:${ascendantDegree.toFixed(2)}:${birthDate.getTime()}`;

    // Check cache first
    const cachedResult = cache.get<YogaDetectionResult>(cacheKey, { ttl: CACHE_TTL_24H });
    if (cachedResult) {
      const duration = Math.round(performance.now() - startTime);
      logger.info("Yogas cache hit", { cacheKey, duration });
      
      return NextResponse.json({
        ascendant_rashi: ascendantRashi,
        planets: buildPlanetDataFromChart(chartPlanets, ascendantDegree),
        yogas: cachedResult.yogas,
        categories: cachedResult.categories,
        summary: cachedResult.summary,
        backend: "internal_ts",
        birth_data: {
          birth_date: birthDate.toISOString(),
          ascendant_longitude: ascendantDegree,
        },
        _meta: {
          calculationTimeMs: duration,
          fromCache: true,
          usedApproximateData: !hasPreCalculatedData,
          timestamp: new Date().toISOString(),
        },
      }, { status: 200 });
    }
    
    logger.info("Detecting Yogas (local)", {
      birthDate: birthDate.toISOString(),
      hasPreCalculatedData,
    });

    // Build planet data structure
    const planetData = buildPlanetDataFromChart(chartPlanets, ascendantDegree);

    // Detect yogas
    const result = detectYogas(planetData, ascendantRashi);

    // Store in cache
    cache.set(cacheKey, result);

    const duration = Math.round(performance.now() - startTime);

    return NextResponse.json({
      ascendant_rashi: ascendantRashi,
      planets: planetData,
      yogas: result.yogas,
      categories: result.categories,
      summary: result.summary,
      backend: "internal_ts",
      birth_data: {
        birth_date: birthDate.toISOString(),
        ascendant_longitude: ascendantDegree,
      },
      _meta: {
        calculationTimeMs: duration,
        fromCache: false,
        usedApproximateData: !hasPreCalculatedData,
        timestamp: new Date().toISOString(),
      },
    }, { status: 200 });
  } catch (error: unknown) {
    const duration = Math.round(performance.now() - startTime);
    logger.error("Yogas API error", { error, duration });

    return NextResponse.json(
      {
        error: "Failed to detect yogas",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

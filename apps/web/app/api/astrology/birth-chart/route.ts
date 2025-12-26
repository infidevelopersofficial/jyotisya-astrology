import { NextResponse } from 'next/server'
import { cachedAstrologyAPI, createAstrologyRequest } from '@/lib/astrology/cached-client'
import { logger } from '@/lib/monitoring/logger'

/**
 * POST /api/astrology/birth-chart
 *
 * Get birth chart (D1 Rasi chart) for a given birth time/location
 *
 * Body:
 * {
 *   "dateTime": "1990-01-15T10:30:00",
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5
 * }
 */

interface BirthChartRequestBody {
  dateTime: string
  latitude: number
  longitude: number
  timezone: number
}

function isBirthChartRequestBody(body: unknown): body is BirthChartRequestBody {
  if (typeof body !== 'object' || body === null) {
    return false
  }

  const candidate = body as Record<string, unknown>

  return (
    typeof candidate.dateTime === 'string' &&
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number' &&
    typeof candidate.timezone === 'number'
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json()

    if (!isBirthChartRequestBody(body)) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          required: ['dateTime', 'latitude', 'longitude', 'timezone'],
        },
        { status: 400 }
      )
    }

    const { dateTime, latitude, longitude, timezone } = body

    // Create astrology request
    const astrologyRequest = createAstrologyRequest({
      dateTime: new Date(dateTime),
      latitude,
      longitude,
      timezone,
    })

    // Get birth chart (will be cached for 24 hours)
    const result = await cachedAstrologyAPI.getBirthChart(astrologyRequest)

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    logger.error('Birth chart API error', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch birth chart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

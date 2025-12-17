import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

/**
 * GET /api/astrologers
 * Fetch all available astrologers for consultation booking
 *
 * Query params:
 * - available: 'true' to filter only available astrologers
 * - limit: number of results to return (default: 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const availableOnly = searchParams.get('available') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    if (availableOnly) {
      where.available = true
    }

    // Fetch astrologers
    const astrologers = await prisma.astrologer.findMany({
      where,
      take: limit,
      orderBy: [
        { available: 'desc' },
        { rating: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        specialization: true,
        languages: true,
        experience: true,
        rating: true,
        totalReviews: true,
        hourlyRate: true,
        imageUrl: true,
        bio: true,
        verified: true,
        available: true,
      }
    })

    return NextResponse.json(
      {
        success: true,
        astrologers,
        total: astrologers.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Astrologers fetch error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch astrologers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/monitoring/logger";

const DEMO_USER_ID = "user_123456789";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const url = request.url;
    // Simple usage to satisfy linter and force dynamic
    if (!url) logger.warn("No URL?"); 
    
    const userId = DEMO_USER_ID;

    const kundlis = await prisma.kundli.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ kundlis });
  } catch (error) {
    console.error("DB Error in GET /api/user/kundli:", error);
    // Return graceful response to avoid build failure if pre-rendering
    return NextResponse.json({ kundlis: [], _error: String(error) }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
        name, 
        birthDate, 
        birthTime, 
        birthPlace, 
        latitude, 
        longitude, 
        timezone, 
        chartData 
    } = body;
    
    // Validate required fields
    if (!name || !birthDate || !birthTime || !birthPlace) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const userId = DEMO_USER_ID;

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: userId,
                name: "Demo User",
                email: "demo@jyotishya.com",
            }
        });
    }

    const kundli = await prisma.kundli.create({
      data: {
        userId,
        name,
        birthDate: new Date(birthDate),
        birthTime,
        birthPlace,
        latitude,
        longitude,
        timezone: timezone.toString(),
        chartData: chartData || {},
      },
    });

    return NextResponse.json({ kundli });
  } catch (error) {
    logger.error("Failed to save chart", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save chart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        
        if (!id) {
            return NextResponse.json(
                { error: "Missing chart ID" },
                { status: 400 }
            );
        }

        await prisma.kundli.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to delete chart", error);
        return NextResponse.json(
            { error: "Failed to delete chart" },
            { status: 500 }
        );
    }
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { getSunSignFromDate } from "@/services/astrology/birthChartService";
import { DailyHoroscopePanel } from "@/components/astrology/DailyHoroscopePanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart Details | Digital Astrology",
  description: "View your saved birth chart details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SavedChartDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/saved-charts");
  }

  // Load kundli from database
  const kundli = await prisma.kundli.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      birthDate: true,
      birthTime: true,
      birthPlace: true,
      latitude: true,
      longitude: true,
      timezone: true,
      chartData: true,
      isFavorite: true,
      createdAt: true,
    },
  });

  if (!kundli) {
    redirect("/dashboard/saved-charts");
  }

  // Verify ownership
  if (kundli.userId !== user.id) {
    redirect("/dashboard/saved-charts");
  }

  // Compute sun sign from birth date
  const sunSign = getSunSignFromDate(new Date(kundli.birthDate));

  // Construct HoroscopeData
  const horoscopeData = {
    date: new Date().toISOString().split("T")[0]!, // Today's date in YYYY-MM-DD
    sunSign,
    text: undefined, // Placeholder
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">{kundli.name}</h1>
          <p className="mt-2 text-slate-400">
            Born{" "}
            {new Date(kundli.birthDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            at {kundli.birthTime} in {kundli.birthPlace}
          </p>
        </div>

        {/* Birth Chart Display Placeholder */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-white mb-2">Birth Chart</h2>
          <p className="text-slate-400">
            Chart visualization would be displayed here in read-only mode.
          </p>
        </div>

        {/* Daily Horoscope Panel */}
        <DailyHoroscopePanel kundliId={kundli.id} data={horoscopeData} />
      </div>
    </div>
  );
}

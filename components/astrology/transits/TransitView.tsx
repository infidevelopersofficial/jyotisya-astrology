"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Card } from "@digital-astrology/ui";

interface TransitAspect {
  transitPlanet: string;
  transitLongitude: number;
  natalPlanet: string;
  natalLongitude: number;
  aspect: string;
  nature: "intense" | "challenging" | "harmonious";
  exactness: number;
  effect: string;
  significance: "critical" | "major" | "notable" | "minor";
}

interface TransitsData {
  transitTime: string;
  summary: {
    totalAspects: number;
    overallTone: "challenging" | "favorable" | "mixed";
    interpretation: string;
  };
  activeTransits: TransitAspect[];
}

interface TransitViewProps {
  birthDetails: {
    dateTime: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
}

export default function TransitView({ birthDetails }: TransitViewProps) {
  const [data, setData] = useState<TransitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    async function fetchTransits() {
      try {
        const response = await fetch("/api/astrology/transits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateTime: birthDetails.dateTime,
            latitude: birthDetails.latitude,
            longitude: birthDetails.longitude,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch transits");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTransits();
    }
  }, [birthDetails, user]);

  if (loading) {
    return (
      <div className="flex animate-pulse flex-col gap-4">
        <div className="h-32 rounded-xl bg-white/5" />
        <div className="h-64 rounded-xl bg-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/10 p-6 text-center text-red-200">
        <p>Error loading transits: {error}</p>
      </Card>
    );
  }

  if (!data) return null;

  const { summary, activeTransits } = data;

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "favorable": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "challenging": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case "harmonious": return "text-emerald-400";
      case "challenging": return "text-red-400";
      case "intense": return "text-purple-400";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={`rounded-xl border p-6 ${getToneColor(summary.overallTone)}`}>
        <h3 className="mb-2 text-lg font-semibold">Cosmic Weather Report</h3>
        <p className="text-xl font-medium mb-1 capitalize">{summary.overallTone} Period</p>
        <p className="text-sm opacity-90">{summary.interpretation}</p>
      </div>

      {/* Active Transits List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Transits</h3>
        
        {activeTransits.map((transit, idx) => (
          <div 
            key={`${transit.transitPlanet}-${transit.natalPlanet}-${idx}`}
            className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            {/* Importance Indicator */}
            {transit.significance === "critical" && (
              <div className="absolute right-0 top-0 rounded-bl-lg bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-300">
                CRITICAL
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-white">{transit.transitPlanet}</span>
                  <span className="text-xs text-slate-500">transiting</span>
                  <span className={`text-sm font-medium ${getNatureColor(transit.nature)} capitalize`}>
                    {transit.aspect}
                  </span>
                  <span className="text-xs text-slate-500">natal</span>
                  <span className="font-semibold text-white">{transit.natalPlanet}</span>
                </div>
                
                <p className="text-sm text-slate-300">{transit.effect}</p>
              </div>
            </div>

            {/* Technical Details (Optional/Collapsible in future) */}
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>Orb: {transit.exactness.toFixed(2)} intensity</span>
              <span className="capitalize text-slate-400">{transit.significance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

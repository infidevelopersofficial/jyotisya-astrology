"use client";

import { useState } from "react";
import MatchInputForm, { MatchProfile } from "./MatchInputForm";
import MatchResult from "./MatchResult";
import { MatchmakingResult } from "@/lib/astrology/calculations/Matchmaking";

export default function MatchingPanel() {
  const [result, setResult] = useState<MatchmakingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profiles, setProfiles] = useState({ boyName: "", girlName: "" });

  const handleMatch = async (boy: MatchProfile, girl: MatchProfile) => {
    setLoading(true);
    setError(null);
    setProfiles({ boyName: boy.name, girlName: girl.name });

    try {
      const response = await fetch("/api/astrology/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boy: { 
             dateTime: boy.dateTime,
             latitude: boy.latitude, 
             longitude: boy.longitude 
          },
          girl: { 
             dateTime: girl.dateTime, 
             latitude: girl.latitude, 
             longitude: girl.longitude 
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate match");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
         <h2 className="text-2xl font-bold text-white">Check Compatibility</h2>
         <p className="text-sm text-slate-400">Enter birth details for both individuals</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-red-300">
          {error}
        </div>
      )}

      {!result ? (
        <MatchInputForm loading={loading} onSubmit={handleMatch} />
      ) : (
        <MatchResult 
           result={result} 
           profiles={profiles} 
           onReset={() => setResult(null)} 
        />
      )}
    </div>
  );
}

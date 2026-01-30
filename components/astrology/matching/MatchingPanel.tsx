"use client";

import { useState } from "react";
import {
  useMatching,
  KOOT_ICONS,
  getScoreColor,
  getVerdictColor,
} from "@/hooks/astrology/useMatching";

interface MatchingPanelProps {
  className?: string;
}

export default function MatchingPanel({ className = "" }: MatchingPanelProps) {
  const { result, loading, error, calculateMatch } = useMatching();
  const [showForm, setShowForm] = useState(true);

  // Form state
  const [brideMoon, setBrideMoon] = useState("");
  const [groomMoon, setGroomMoon] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const brideMoonLongitude = parseFloat(brideMoon);
    const groomMoonLongitude = parseFloat(groomMoon);

    if (isNaN(brideMoonLongitude) || isNaN(groomMoonLongitude)) {
      return;
    }

    await calculateMatch({
      brideMoonLongitude,
      groomMoonLongitude,
      brideName: brideName || "Bride",
      groomName: groomName || "Groom",
    });

    setShowForm(false);
  };

  const handleReset = () => {
    setShowForm(true);
  };

  return (
    <div className={`rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="text-2xl">💑</span>
          Kundli Matching
        </h3>
        <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-300">
          Ashtakoot Milan
        </span>
      </div>

      {/* Info Text */}
      <div className="mb-6 rounded-lg bg-white/5 p-4">
        <p className="text-sm text-slate-300">
          <strong>Ashtakoot Milan</strong> is an 8-factor compatibility system used in Vedic
          astrology for marriage matching. It analyzes the Moon positions of both individuals
          to calculate a compatibility score out of 36 points.
        </p>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bride Section */}
            <div className="rounded-xl bg-pink-500/10 p-4 border border-pink-500/20">
              <p className="mb-3 text-sm font-medium text-pink-300">👰 Bride Details</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Name (optional)</label>
                  <input
                    type="text"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="Bride's name"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Moon Longitude (0-360°) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="360"
                    value={brideMoon}
                    onChange={(e) => setBrideMoon(e.target.value)}
                    placeholder="e.g. 145.5"
                    required
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Groom Section */}
            <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
              <p className="mb-3 text-sm font-medium text-blue-300">🤵 Groom Details</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Name (optional)</label>
                  <input
                    type="text"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="Groom's name"
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Moon Longitude (0-360°) <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="360"
                    value={groomMoon}
                    onChange={(e) => setGroomMoon(e.target.value)}
                    placeholder="e.g. 280.3"
                    required
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 py-3 font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Calculating...
              </span>
            ) : (
              "Calculate Compatibility"
            )}
          </button>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-500/20 p-4 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !showForm && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="rounded-xl bg-gradient-to-r from-pink-600/30 to-rose-600/30 p-5 border border-pink-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-200">Compatibility Score</p>
                <p className="text-4xl font-bold text-white">
                  {result.totalScore}
                  <span className="text-xl text-pink-300">/{result.maxScore}</span>
                </p>
                <p className="text-sm text-slate-400">{result.percentage}% match</p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${getVerdictColor(result.verdict)}`}>
                  {result.verdict}
                </p>
                <p className="mt-1 text-sm text-slate-300">{result.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Couple Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-pink-500/10 p-4 border border-pink-500/20">
              <p className="font-semibold text-pink-300">👰 {result.bride.name}</p>
              <p className="text-sm text-slate-400">
                {result.bride.nakshatra} • {result.bride.rashi}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
              <p className="font-semibold text-blue-300">🤵 {result.groom.name}</p>
              <p className="text-sm text-slate-400">
                {result.groom.nakshatra} • {result.groom.rashi}
              </p>
            </div>
          </div>

          {/* Koot Details */}
          <div>
            <p className="mb-4 text-sm font-medium text-slate-300">Compatibility Breakdown</p>
            <div className="space-y-2">
              {result.koots.map((koot, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-white/5 p-3 hover:bg-white/10 transition"
                >
                  <span className="text-xl">{KOOT_ICONS[koot.name] || "•"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-white">{koot.name}</p>
                    <p className="text-xs text-slate-400">{koot.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getScoreColor(koot.score, koot.maxScore)}`}>
                      {koot.score}/{koot.maxScore}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full rounded-lg border border-pink-500/30 py-2 text-pink-300 transition hover:bg-pink-500/10"
          >
            Calculate Another Match
          </button>
        </div>
      )}
    </div>
  );
}

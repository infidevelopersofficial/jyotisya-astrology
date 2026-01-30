"use client";

import { useEffect } from "react";
import {
  useTransits,
  ASPECT_SYMBOLS,
  ASPECT_COLORS,
  NATURE_COLORS,
  SIGNIFICANCE_STYLES,
  TONE_STYLES,
  getMajorTransits,
} from "@/hooks/astrology/useTransits";

interface TransitsPanelProps {
  birthData: {
    dateTime: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  showHelp?: boolean;
}

export default function TransitsPanel({ birthData, showHelp = false }: TransitsPanelProps) {
  const { transits, loading, error, fetchTransits } = useTransits();

  useEffect(() => {
    if (birthData.dateTime && birthData.latitude && birthData.longitude) {
      const dt = new Date(birthData.dateTime);
      fetchTransits({
        year: dt.getFullYear(),
        month: dt.getMonth() + 1,
        date: dt.getDate(),
        hours: dt.getHours(),
        minutes: dt.getMinutes(),
        seconds: dt.getSeconds(),
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: birthData.timezone || 5.5,
      });
    }
  }, [birthData, fetchTransits]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
          <span className="text-slate-400">Analyzing current transits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-red-300">Failed to calculate transits: {error}</p>
      </div>
    );
  }

  if (!transits) return null;

  const defaultToneStyle = { bg: "from-purple-500/20 to-blue-500/20", text: "text-purple-400", icon: "🔄" };
  const toneStyle = TONE_STYLES[transits.summary.overallTone] ?? defaultToneStyle;
  const majorTransits = getMajorTransits(transits.activeTransits);

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="text-2xl">🌌</span>
          Current Transits
        </h3>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
          {transits.summary.totalAspects} aspects
        </span>
      </div>

      {/* Help Text */}
      {showHelp && (
        <div className="mb-6 rounded-lg bg-white/5 p-4">
          <p className="text-sm text-slate-300">
            <strong>Transits</strong> show how the current positions of planets create
            aspects (angular relationships) with your natal chart. Major transits from
            slow-moving planets (Jupiter, Saturn, Rahu, Ketu) have long-lasting effects.
          </p>
        </div>
      )}

      {/* Overall Tone Card */}
      <div className={`mb-6 rounded-xl bg-gradient-to-r ${toneStyle.bg} p-5 border border-blue-400/20`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200">Overall Tone</p>
            <p className={`text-2xl font-bold ${toneStyle.text}`}>
              {toneStyle.icon} {transits.summary.overallTone.charAt(0).toUpperCase() + transits.summary.overallTone.slice(1)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex gap-4 text-sm">
              <span className="text-green-400">✓ {transits.summary.harmoniousCount} harmonious</span>
              <span className="text-red-400">✗ {transits.summary.challengingCount} challenging</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-300">{transits.summary.interpretation}</p>
      </div>

      {/* Major Transits */}
      {majorTransits.length > 0 && (
        <div className="mb-6">
          <p className="mb-4 text-sm font-medium text-slate-300">Major Transits</p>
          <div className="space-y-3">
            {majorTransits.slice(0, 5).map((transit, index) => {
              const defaultSigStyle = { bg: "bg-slate-500/20", text: "text-slate-400" };
              const sigStyle = SIGNIFICANCE_STYLES[transit.significance] ?? defaultSigStyle;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-lg bg-white/5 p-4 hover:bg-white/10 transition"
                >
                  {/* Aspect Symbol */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold"
                    style={{ backgroundColor: (ASPECT_COLORS[transit.aspect] ?? "#666") + "30", color: ASPECT_COLORS[transit.aspect] ?? "#666" }}
                  >
                    {ASPECT_SYMBOLS[transit.aspect] ?? "•"}
                  </div>

                  {/* Transit Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {transit.transitPlanet}
                      <span className="mx-2 text-slate-400">{transit.aspect}</span>
                      Natal {transit.natalPlanet}
                    </p>
                    <p className="text-xs text-slate-400">{transit.effect}</p>
                  </div>

                  {/* Nature & Significance */}
                  <div className="text-right">
                    <span
                      className="inline-block rounded px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: (NATURE_COLORS[transit.nature] ?? "#666") + "20", color: NATURE_COLORS[transit.nature] ?? "#666" }}
                    >
                      {transit.nature}
                    </span>
                    <span className={`ml-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${sigStyle.bg} ${sigStyle.text}`}>
                      {transit.significance}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {majorTransits.length > 5 && (
            <p className="mt-3 text-center text-sm text-slate-500">
              +{majorTransits.length - 5} more major transits
            </p>
          )}
        </div>
      )}

      {/* Current Positions */}
      <div>
        <p className="mb-4 text-sm font-medium text-slate-300">Current Planet Positions</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Object.entries(transits.currentPositions).map(([planet, lon]) => (
            <div key={planet} className="rounded-lg bg-white/5 p-2 text-center">
              <p className="text-xs font-medium text-white">{planet}</p>
              <p className="text-xs text-slate-500">{(lon as number).toFixed(1)}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

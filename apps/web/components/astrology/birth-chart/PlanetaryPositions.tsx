/* eslint-disable react/no-unescaped-entities */
"use client";

import type { Planet } from "@/types/astrology/birthChart.types";
import { formatDegree, isRetrograde } from "@/services/astrology/birthChartService";
import { planetMeanings, signMeanings } from "@/constants/astrology/meanings";

interface PlanetaryPositionsProps {
  planets: Planet[];
  showHelp: boolean;
  expandedPlanet: string | null;
  onTogglePlanet: (planetName: string) => void;
}

export default function PlanetaryPositions({
  planets,
  showHelp,
  expandedPlanet,
  onTogglePlanet,
}: PlanetaryPositionsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
        <span className="text-2xl">🪐</span>
        Planetary Positions
      </h3>

      {showHelp && (
        <p className="mb-5 text-sm text-slate-400">
          Click any planet to see what it represents in your chart
        </p>
      )}

      <div className="space-y-3">
        {planets.map((planet, idx) => {
          const meaning = planetMeanings[planet.name];
          const signInfo = signMeanings[planet.sign || ""];
          const isExpanded = expandedPlanet === planet.name;
          const planetIsRetrograde = isRetrograde(planet.isRetro);

          return (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <button
                onClick={() => onTogglePlanet(planet.name)}
                className="w-full p-5 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{meaning?.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{planet.name}</p>
                      {meaning && <p className="text-xs text-slate-400">{meaning.area}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-semibold ${signInfo?.color || "text-white"}`}>
                        {planet.sign}
                      </p>
                      <p className="text-xs text-slate-500">{formatDegree(planet.normDegree)}</p>
                    </div>

                    {planetIsRetrograde && (
                      <span className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-300">
                        ℞ Retro
                      </span>
                    )}

                    <span className="text-slate-400 transition-transform group-hover:translate-x-0.5">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Info */}
              {isExpanded && showHelp && meaning && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 border-t border-white/10 bg-white/5 p-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300">
                        Meaning
                      </p>
                      <p className="text-sm leading-relaxed text-white">{meaning.meaning}</p>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300">
                        In {planet.sign}
                      </p>
                      <p className="text-sm leading-relaxed text-white">
                        {signInfo
                          ? `${signInfo.element} element – ${signInfo.nature}`
                          : `Influences your ${meaning.area}`}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-300">
                        House
                      </p>
                      <p className="text-sm text-white">House {planet.house || "?"}</p>
                    </div>

                    {planetIsRetrograde && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-red-300">
                          Retrograde
                        </p>
                        <p className="text-sm leading-relaxed text-white">
                          Appears to move backward – internalized energy
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

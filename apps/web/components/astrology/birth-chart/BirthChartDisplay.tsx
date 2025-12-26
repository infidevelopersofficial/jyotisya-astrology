/* eslint-disable react/no-unescaped-entities */
"use client";

import type {
  BirthData,
  BirthChartResponse,
  ChartSVGResponse,
} from "@/types/astrology/birthChart.types";
import {
  getDisplayChartName,
  getSignName,
  formatDegree,
} from "@/services/astrology/birthChartService";
import { getFormattedBirthDateTime } from "@/services/astrology/birthChartService";
import PlanetaryPositions from "./PlanetaryPositions";
import HousesGuide from "./HousesGuide";

interface BirthChartDisplayProps {
  birthData: BirthData;
  chartData: BirthChartResponse;
  svgData: ChartSVGResponse | undefined;
  showHelp: boolean;
  expandedPlanet: string | null;
  onTogglePlanet: (name: string) => void;
  onSwitchToForm: () => void;
  onSwitchToDivisional: () => void;
  downloadingPNG: boolean;
  downloadingPDF: boolean;
  copiedLink: boolean;
  savingChart: boolean;
  savedChartId: string | null;
  onDownloadPNG: () => void;
  onDownloadPDF: () => void;
  onCopyLink: () => void;
  onSaveChart: () => void;
}

export default function BirthChartDisplay({
  birthData,
  chartData,
  svgData,
  showHelp,
  expandedPlanet,
  onTogglePlanet,
  onSwitchToDivisional,
  downloadingPNG,
  downloadingPDF,
  copiedLink,
  savingChart,
  savedChartId,
  onDownloadPNG,
  onDownloadPDF,
  onCopyLink,
  onSaveChart,
}: BirthChartDisplayProps) {
  const formatted = getFormattedBirthDateTime(birthData.dateTime);

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-5">
        <p className="flex items-center gap-2.5 text-lg font-semibold text-green-100">
          <span className="text-2xl">🎉</span>
          {getDisplayChartName(birthData, true)} is Ready!
        </p>
        <p className="mt-2 text-sm text-green-200/80">
          Born {formatted.date} at {formatted.time} in {birthData.location}
        </p>
      </div>

      {/* Understanding Your Chart */}
      {showHelp && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="mb-2 flex items-center gap-2 font-semibold text-blue-200">
            <span className="text-xl">📘</span>
            Understanding Your Chart
          </p>
          <p className="text-sm leading-relaxed text-blue-300/90">
            Your birth chart is a cosmic snapshot of the sky at your birth moment. It shows where
            planets were positioned, influencing your personality and life path.
          </p>
        </div>
      )}

      {/* Ascendant Display */}
      {chartData.data.ascendant !== undefined && (
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-pink-500/15 p-6 shadow-lg">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-orange-200">
                <span className="text-xl">🌅</span>
                Rising Sign (Ascendant)
              </p>
              <p className="text-4xl font-bold text-white">
                {getSignName(Math.floor(chartData.data.ascendant / 30) + 1)}{" "}
                {formatDegree(chartData.data.ascendant % 30)}
              </p>
            </div>
            {chartData.from_cache && (
              <span className="rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300">
                From cache
              </span>
            )}
          </div>

          {showHelp && (
            <div className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-1 text-sm font-semibold text-white">What is the Ascendant?</p>
              <p className="text-sm leading-relaxed text-slate-200">
                How others perceive you and your approach to life, determined by your exact birth
                time and place.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Planetary Positions */}
      {chartData.data.planets && chartData.data.planets.length > 0 && (
        <PlanetaryPositions
          planets={chartData.data.planets}
          showHelp={showHelp}
          expandedPlanet={expandedPlanet}
          onTogglePlanet={onTogglePlanet}
        />
      )}

      {/* Houses Guide */}
      {showHelp && <HousesGuide />}

      {/* Chart Visualization */}
      {svgData && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-2xl">📈</span>
              Visual Chart
            </h3>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onSaveChart}
                disabled={savingChart || !!savedChartId}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                title="Save to your account"
              >
                {savingChart ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    <span>Saving...</span>
                  </>
                ) : savedChartId ? (
                  <>
                    <span>✅</span>
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save</span>
                  </>
                )}
              </button>

              <button
                onClick={onDownloadPNG}
                disabled={downloadingPNG}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                title="Download as image"
              >
                {downloadingPNG ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    <span>PNG</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>PNG</span>
                  </>
                )}
              </button>

              <button
                onClick={onDownloadPDF}
                disabled={downloadingPDF}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                title="Download as PDF"
              >
                {downloadingPDF ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    <span>PDF</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={onCopyLink}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl"
                title="Copy shareable link"
              >
                {copiedLink ? (
                  <>
                    <span>✅</span>
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showHelp && (
            <p className="mb-5 text-sm text-slate-400">
              Traditional South Indian style chart showing planetary positions
            </p>
          )}

          <div
            id="rasi-chart"
            className="flex justify-center rounded-xl bg-white p-8 shadow-inner"
            dangerouslySetInnerHTML={{ __html: svgData.data.svg_code }}
          />
        </div>
      )}

      {/* Next Steps Card */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
        <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <span className="text-xl">🎯</span>
          Next Steps
        </p>
        <ul className="mb-5 space-y-2.5 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            <span>
              Explore <strong className="text-white">Divisional Charts</strong> for marriage,
              career, and wealth insights
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            <span>Consult with an astrologer for personalized readings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-indigo-400">•</span>
            <span>Save this chart for future reference and analysis</span>
          </li>
        </ul>
        <button
          onClick={onSwitchToDivisional}
          className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl"
        >
          <span>Explore Divisional Charts</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}

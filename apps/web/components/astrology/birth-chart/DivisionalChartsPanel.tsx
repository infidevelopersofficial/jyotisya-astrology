'use client'

import type { ChartSVGResponse } from '@/types/astrology/birthChart.types'
import { DIVISIONAL_CHARTS } from '@/services/astrology/birthChartService'

interface DivisionalChartsPanelProps {
  svgData: { [key: string]: ChartSVGResponse }
  selectedDivisional: string
  onSelectDivisional: (code: string) => void
}

export default function DivisionalChartsPanel({
  svgData,
  selectedDivisional,
  onSelectDivisional,
}: DivisionalChartsPanelProps) {
  const selectedChart = DIVISIONAL_CHARTS.find((c) => c.code === selectedDivisional)
  const beginnerCharts = DIVISIONAL_CHARTS.filter((c) => c.beginner)
  const advancedCharts = DIVISIONAL_CHARTS.filter((c) => !c.beginner)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="mb-2 flex items-center gap-2 text-lg font-semibold text-blue-100">
          <span className="text-2xl">🔍</span>
          Dive Deeper Into Your Life
        </p>
        <p className="text-sm text-blue-300/90">
          Divisional charts (Vargas) provide focused insights into specific life areas
        </p>
      </div>

      {/* Chart Selection Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Beginner Charts */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span>⭐</span>
            <span>Start Here</span>
          </h3>

          <div className="space-y-2.5">
            {beginnerCharts.map((chart) => (
              <button
                key={chart.code}
                onClick={() => onSelectDivisional(chart.code)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedDivisional === chart.code
                    ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{chart.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{chart.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{chart.desc}</p>
                  </div>
                  {selectedDivisional === chart.code && (
                    <span className="text-lg text-orange-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Charts */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span>🎓</span>
            <span>Advanced</span>
          </h3>

          <div className="space-y-2.5">
            {advancedCharts.map((chart) => (
              <button
                key={chart.code}
                onClick={() => onSelectDivisional(chart.code)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedDivisional === chart.code
                    ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{chart.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{chart.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{chart.desc}</p>
                  </div>
                  {selectedDivisional === chart.code && (
                    <span className="text-lg text-purple-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Chart Display */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="mb-5 text-xl font-semibold text-white">
          {selectedChart?.name || selectedDivisional}
        </h3>

        {svgData[selectedDivisional] ? (
          <div
            className="flex justify-center rounded-xl bg-white p-8 shadow-inner"
            dangerouslySetInnerHTML={{
              __html: svgData[selectedDivisional].data.svg_code,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 py-20">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-orange-500"></div>
            <p className="text-sm text-slate-400">
              Loading {selectedDivisional} chart...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

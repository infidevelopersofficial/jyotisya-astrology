/* eslint-disable react/no-unescaped-entities */
'use client'

import { useBirthChart } from '@/hooks/astrology/useBirthChart'
import { useBirthChartActions } from '@/hooks/astrology/useBirthChartActions'
import BirthChartForm from './BirthChartForm'
import BirthChartDisplay from './BirthChartDisplay'
import DivisionalChartsPanel from './DivisionalChartsPanel'

interface BirthChartGeneratorProps {
  userId: string
  userEmail: string
}

export default function BirthChartGeneratorV2({
  userId: _userId,
  userEmail: _userEmail,
}: BirthChartGeneratorProps) {
  const {
    state,
    activeTab,
    showHelp,
    expandedPlanet,
    setBirthData,
    setActiveTab,
    setShowHelp,
    setExpandedPlanet,
    setError,
    generateBirthChart,
    selectDivisional,
  } = useBirthChart()

  const {
    downloadingPNG,
    downloadingPDF,
    copiedLink,
    savingChart,
    savedChartId,
    handleDownloadPNG,
    handleDownloadPDF,
    handleCopyShareLink,
    handleSaveChart,
  } = useBirthChartActions({
    birthData: state.birthData,
    chartData: state.chartData,
    selectedDivisional: state.selectedDivisional,
    setError,
  })

  return (
    <div className="space-y-8">
      {/* Compact Help Toggle */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
            showHelp
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
              : 'border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="text-lg">💡</span>
          <span>{showHelp ? 'Help enabled' : 'Enable help'}</span>
          {showHelp && <span className="text-xs opacity-75">✓</span>}
        </button>
      </div>

      {/* Clean Progress Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === 'form'
                  ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : state.chartData
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
              }`}
            >
              {state.chartData ? '✓' : '1'}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                activeTab === 'form' || state.chartData ? 'text-white' : 'text-slate-500'
              }`}
            >
              Enter Details
            </span>
          </div>

          {/* Connector 1 */}
          <div className="relative flex-1 px-6">
            <div className="h-0.5 w-full bg-slate-700">
              {state.chartData && (
                <div className="h-full w-full bg-gradient-to-r from-green-500 to-orange-500"></div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === 'chart' && state.chartData
                  ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : state.chartData
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                state.chartData ? 'text-white' : 'text-slate-500'
              }`}
            >
              View Chart
            </span>
          </div>

          {/* Connector 2 */}
          <div className="relative flex-1 px-6">
            <div className="h-0.5 w-full bg-slate-700">
              {activeTab === 'divisional' && state.chartData && (
                <div className="h-full w-full bg-gradient-to-r from-orange-500 to-purple-500"></div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                activeTab === 'divisional' && state.chartData
                  ? 'border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : state.chartData
                    ? 'border-slate-600 bg-slate-700 text-slate-400'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                activeTab === 'divisional' && state.chartData ? 'text-white' : 'text-slate-500'
              }`}
            >
              Explore More
            </span>
          </div>
        </div>
      </div>

      {/* Simplified Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-semibold transition-all ${
            activeTab === 'form'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="text-xl">📝</span>
          <span>Details</span>
        </button>

        <button
          onClick={() => setActiveTab('chart')}
          disabled={!state.chartData}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === 'chart'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:hover:bg-white/5'
          }`}
        >
          <span className="text-xl">🌟</span>
          <span>Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('divisional')}
          disabled={!state.chartData}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === 'divisional'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:hover:bg-white/5'
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Explore</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'form' && (
        <BirthChartForm
          birthData={state.birthData}
          setBirthData={setBirthData}
          loading={state.loading}
          error={state.error}
          showHelp={showHelp}
          onGenerate={generateBirthChart}
          onDismissError={() => setError(null)}
        />
      )}

      {activeTab === 'chart' && state.chartData && (
        <BirthChartDisplay
          birthData={state.birthData}
          chartData={state.chartData}
          svgData={state.svgData['D1']}
          showHelp={showHelp}
          expandedPlanet={expandedPlanet}
          onTogglePlanet={(name) =>
            setExpandedPlanet(expandedPlanet === name ? null : name)
          }
          onSwitchToForm={() => setActiveTab('form')}
          onSwitchToDivisional={() => setActiveTab('divisional')}
          downloadingPNG={downloadingPNG}
          downloadingPDF={downloadingPDF}
          copiedLink={copiedLink}
          savingChart={savingChart}
          savedChartId={savedChartId}
          onDownloadPNG={handleDownloadPNG}
          onDownloadPDF={handleDownloadPDF}
          onCopyLink={handleCopyShareLink}
          onSaveChart={handleSaveChart}
        />
      )}

      {activeTab === 'divisional' && state.chartData && (
        <DivisionalChartsPanel
          svgData={state.svgData}
          selectedDivisional={state.selectedDivisional}
          onSelectDivisional={selectDivisional}
        />
      )}
    </div>
  )
}

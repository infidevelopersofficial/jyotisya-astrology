/**
 * useBirthChart - Main state management hook
 * Handles birth chart data, API calls, and state updates
 */

'use client'

import { useState } from 'react'
import type {
  BirthData,
  BirthChartResponse,
  ChartSVGResponse,
  BirthChartState,
  TabType,
} from '@/types/astrology/birthChart.types'
import { transformChartData } from '@/services/astrology/birthChartTransformers'
import { validateBirthData } from '@/services/astrology/birthChartService'
import { trackChartGenerated } from '@/lib/analytics/events'

// eslint-disable-next-line complexity, max-lines-per-function
export function useBirthChart() {
  const [activeTab, setActiveTab] = useState<TabType>('form')
  const [showHelp, setShowHelp] = useState(true)
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)

  const [birthData, setBirthData] = useState<BirthData>({
    dateTime: '',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
    location: 'Delhi, India',
    chartName: '',
  })

  const [chartData, setChartData] = useState<BirthChartResponse | null>(null)
  const [svgData, setSvgData] = useState<{ [key: string]: ChartSVGResponse }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDivisional, setSelectedDivisional] = useState<string>('D1')

  /**
   * Generate birth chart from current birth data
   */
  const generateBirthChart = async (): Promise<void> => {
    const validation = validateBirthData(birthData)
    if (!validation.valid) {
      setError(validation.error || 'Invalid birth data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/astrology/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate chart')
      }

      const rawData = await response.json()
      const transformedData = transformChartData(rawData)
      setChartData(transformedData)
      setActiveTab('chart')
      await fetchSVG('D1')

      // Track analytics
      trackChartGenerated({
        hasChartName: !!birthData.chartName?.trim(),
        location: birthData.location,
        timeZone: birthData.timezone.toString(),
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch SVG visualization for a specific chart type
   */
  const fetchSVG = async (chartType: string): Promise<void> => {
    if (svgData[chartType]) return

    try {
      const response = await fetch('/api/astrology/chart-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
          chartType,
        }),
      })

      if (!response.ok) throw new Error('Failed to load chart visualization')

      const data: ChartSVGResponse = await response.json()
      setSvgData((prev) => ({ ...prev, [chartType]: data }))
    } catch (err) {
      console.error(`Failed to load ${chartType}:`, err)
    }
  }

  /**
   * Select a divisional chart and load its SVG
   */
  const selectDivisional = (code: string): void => {
    setSelectedDivisional(code)
    fetchSVG(code).catch((err) => console.error('Failed to fetch SVG:', err))
  }

  const state: BirthChartState = {
    birthData,
    chartData,
    svgData,
    loading,
    error,
    selectedDivisional,
    downloadingPNG: false,
    downloadingPDF: false,
    copiedLink: false,
    savingChart: false,
    savedChartId: null,
  }

  return {
    // State
    state,
    activeTab,
    showHelp,
    expandedPlanet,

    // Setters
    setBirthData,
    setActiveTab,
    setShowHelp,
    setExpandedPlanet,
    setError,

    // Actions
    generateBirthChart,
    selectDivisional,
  }
}

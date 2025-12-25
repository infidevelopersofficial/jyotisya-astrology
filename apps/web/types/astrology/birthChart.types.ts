/**
 * Type definitions for Birth Chart feature
 */

export interface BirthData {
  dateTime: string
  latitude: number
  longitude: number
  timezone: number
  location: string
  chartName?: string
}

export interface Planet {
  name: string
  fullDegree: number
  normDegree: number
  speed?: number
  isRetro: string | boolean
  sign?: string
  signLord?: string
  nakshatra?: string
  nakshatraLord?: string
  house?: number
}

export interface BirthChartResponse {
  data: {
    statusCode?: number
    input?: unknown
    output?: unknown[]
    ascendant?: number
    planets?: Planet[]
    houses?: unknown[]
  }
  from_cache?: boolean
  cached_at?: string
}

export interface ChartSVGResponse {
  data: {
    svg_code: string
    chart_name: string
  }
  from_cache?: boolean
}

export type TabType = 'form' | 'chart' | 'divisional'

export interface DivisionalChart {
  code: string
  name: string
  icon: string
  desc: string
  beginner: boolean
}

export interface PlanetMeaning {
  icon: string
  meaning: string
  area: string
}

export interface SignMeaning {
  element: string
  nature: string
  color: string
}

export interface HouseMeaning {
  name: string
  meaning: string
  lifeArea: string
}

export interface BirthChartState {
  birthData: BirthData
  chartData: BirthChartResponse | null
  svgData: { [key: string]: ChartSVGResponse }
  loading: boolean
  error: string | null
  selectedDivisional: string
  downloadingPNG: boolean
  downloadingPDF: boolean
  copiedLink: boolean
  savingChart: boolean
  savedChartId: string | null
}

export interface BirthChartActions {
  generateChart: () => Promise<void>
  downloadPNG: () => Promise<void>
  downloadPDF: () => Promise<void>
  saveChart: () => Promise<void>
  copyShareLink: () => Promise<void>
  selectDivisional: (code: string) => void
}

export interface DownloadOptions {
  filename: string
  chartName: string
  birthDate?: string
  birthPlace: string
}

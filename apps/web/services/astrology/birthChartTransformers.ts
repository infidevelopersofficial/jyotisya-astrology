/**
 * Birth Chart Data Transformers
 * Functions to transform API responses into UI-friendly models
 */

import type {
  BirthChartResponse,
  Planet,
} from '@/types/astrology/birthChart.types'
import { getSignName } from './birthChartService'

/**
 * Transform raw API response to structured chart data
 * Maps the nested API structure to a flatter, more usable format
 */
export function transformChartData(
  rawData: BirthChartResponse | Record<string, unknown>
): BirthChartResponse {
  const data = rawData.data as Record<string, unknown>

  if (data?.output && Array.isArray(data.output)) {
    const planetData = data.output[1] as Record<string, Record<string, unknown>>
    const ascendantData = (
      data.output[0] as Record<string, Record<string, unknown>>
    )?.['0']

    const planetsArray = transformPlanets(planetData)

    return {
      ...rawData,
      data: {
        ...data,
        ascendant: (ascendantData?.fullDegree as number) || 0,
        planets: planetsArray,
      },
    } as BirthChartResponse
  }

  return rawData as BirthChartResponse
}

/**
 * Transform planet data from API format to UI model
 */
function transformPlanets(
  planetData: Record<string, Record<string, unknown>>
): Planet[] {
  const planetNames = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
    'Rahu',
    'Ketu',
  ]

  const planetsArray: Planet[] = []

  planetNames.forEach((name) => {
    if (planetData[name]) {
      const p = planetData[name]
      planetsArray.push({
        name,
        fullDegree: (p.fullDegree as number) || 0,
        normDegree: (p.normDegree as number) || 0,
        isRetro: (p.isRetro as string | boolean) || false,
        sign: getSignName((p.current_sign as number) || 1),
        house: p.house_number as number,
      })
    }
  })

  return planetsArray
}

/**
 * Tests for DailyHoroscopePanel component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyHoroscopePanel } from '@/components/astrology/DailyHoroscopePanel'
import type { HoroscopeData } from '@/types/astrology/horoscope.types'

describe('DailyHoroscopePanel', () => {
  it('should show the correct Sign when given a sample HoroscopeData', () => {
    const sampleData: HoroscopeData = {
      date: '2025-12-24',
      sunSign: 'Scorpio',
      text: undefined,
    }

    render(<DailyHoroscopePanel kundliId="test-id" data={sampleData} />)

    expect(screen.getByText('Today\'s Horoscope')).toBeTruthy()
    expect(screen.getByText('Sign: Scorpio')).toBeTruthy()
  })

  it('should render the placeholder text when data.text is undefined', () => {
    const sampleData: HoroscopeData = {
      date: '2025-12-24',
      sunSign: 'Scorpio',
      text: undefined,
    }

    render(<DailyHoroscopePanel kundliId="test-id" data={sampleData} />)

    expect(screen.getByText('Personalized horoscope coming soon. This space is reserved for your daily reading.')).toBeTruthy()
  })

  it('should render the provided text when data.text is defined', () => {
    const sampleData: HoroscopeData = {
      date: '2025-12-24',
      sunSign: 'Scorpio',
      text: 'Today is a great day for Scorpios!',
    }

    render(<DailyHoroscopePanel kundliId="test-id" data={sampleData} />)

    expect(screen.getByText('Today is a great day for Scorpios!')).toBeTruthy()
    expect(screen.queryByText('Personalized horoscope coming soon. This space is reserved for your daily reading.')).toBeNull()
  })
})
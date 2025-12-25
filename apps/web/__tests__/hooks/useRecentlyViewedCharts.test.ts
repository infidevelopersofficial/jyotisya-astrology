/**
 * Tests for useRecentlyViewedCharts hook
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecentlyViewedCharts } from '@/hooks/useRecentlyViewedCharts'
import type { SavedChartListItem } from '@/types/savedChart.types'

// Mock chart data
const mockChart1: SavedChartListItem = {
  id: 'chart-1',
  name: 'John Doe',
  birthDate: '1990-01-15T10:30:00Z',
  birthTime: '10:30',
  birthPlace: 'New York, USA',
  isFavorite: false,
  createdAt: '2025-01-20T10:00:00Z',
}

const mockChart2: SavedChartListItem = {
  id: 'chart-2',
  name: 'Jane Smith',
  birthDate: '1995-06-20T14:00:00Z',
  birthTime: '14:00',
  birthPlace: 'London, UK',
  isFavorite: true,
  createdAt: '2025-01-19T15:00:00Z',
}

const mockChart3: SavedChartListItem = {
  id: 'chart-3',
  name: 'Alice Johnson',
  birthDate: '1988-03-10T08:15:00Z',
  birthTime: '08:15',
  birthPlace: 'Delhi, India',
  isFavorite: false,
  createdAt: '2025-01-18T12:00:00Z',
}

const mockChart4: SavedChartListItem = {
  id: 'chart-4',
  name: 'Bob Williams',
  birthDate: '1992-11-05T16:45:00Z',
  birthTime: '16:45',
  birthPlace: 'Sydney, Australia',
  isFavorite: true,
  createdAt: '2025-01-17T09:00:00Z',
}

describe('useRecentlyViewedCharts', () => {
  it('should start with an empty list', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    expect(result.current.recentlyViewed).toEqual([])
  })

  it('should add a chart to recently viewed list', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    act(() => {
      result.current.addToRecent(mockChart1)
    })

    expect(result.current.recentlyViewed).toHaveLength(1)
    expect(result.current.recentlyViewed[0]).toEqual(mockChart1)
  })

  it('should maintain most recent first order', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    // Add charts in sequence
    act(() => {
      result.current.addToRecent(mockChart1)
    })
    act(() => {
      result.current.addToRecent(mockChart2)
    })
    act(() => {
      result.current.addToRecent(mockChart3)
    })

    // Most recent should be first
    expect(result.current.recentlyViewed).toHaveLength(3)
    expect(result.current.recentlyViewed[0]!.id).toBe('chart-3') // Last added
    expect(result.current.recentlyViewed[1]!.id).toBe('chart-2')
    expect(result.current.recentlyViewed[2]!.id).toBe('chart-1') // First added
  })

  it('should not store duplicates - move existing chart to front', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    // Add three different charts
    act(() => {
      result.current.addToRecent(mockChart1)
      result.current.addToRecent(mockChart2)
      result.current.addToRecent(mockChart3)
    })

    expect(result.current.recentlyViewed).toHaveLength(3)

    // Click on chart 1 again (which is at the end)
    act(() => {
      result.current.addToRecent(mockChart1)
    })

    // Should still have 3 charts (no duplicate)
    expect(result.current.recentlyViewed).toHaveLength(3)
    // Chart 1 should now be first
    expect(result.current.recentlyViewed[0]!.id).toBe('chart-1')
    expect(result.current.recentlyViewed[1]!.id).toBe('chart-3')
    expect(result.current.recentlyViewed[2]!.id).toBe('chart-2')
  })

  it('should limit to maximum of 3 charts', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    // Add 4 charts
    act(() => {
      result.current.addToRecent(mockChart1)
      result.current.addToRecent(mockChart2)
      result.current.addToRecent(mockChart3)
      result.current.addToRecent(mockChart4)
    })

    // Should only keep 3 most recent
    expect(result.current.recentlyViewed).toHaveLength(3)
    expect(result.current.recentlyViewed[0]!.id).toBe('chart-4') // Most recent
    expect(result.current.recentlyViewed[1]!.id).toBe('chart-3')
    expect(result.current.recentlyViewed[2]!.id).toBe('chart-2')
    // Chart 1 should be dropped
    expect(result.current.recentlyViewed.find((c) => c.id === 'chart-1')).toBeUndefined()
  })

  it('should clear all recently viewed charts', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    // Add some charts
    act(() => {
      result.current.addToRecent(mockChart1)
      result.current.addToRecent(mockChart2)
    })

    expect(result.current.recentlyViewed).toHaveLength(2)

    // Clear the list
    act(() => {
      result.current.clearRecent()
    })

    expect(result.current.recentlyViewed).toEqual([])
  })

  it('should handle clicking the same chart multiple times in a row', () => {
    const { result } = renderHook(() => useRecentlyViewedCharts())

    // Click same chart 3 times
    act(() => {
      result.current.addToRecent(mockChart1)
      result.current.addToRecent(mockChart1)
      result.current.addToRecent(mockChart1)
    })

    // Should only appear once
    expect(result.current.recentlyViewed).toHaveLength(1)
    expect(result.current.recentlyViewed[0]!.id).toBe('chart-1')
  })
})

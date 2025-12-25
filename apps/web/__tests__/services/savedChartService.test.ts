/**
 * Tests for savedChartService
 */

import { describe, it, expect } from 'vitest'
import {
  sortCharts,
  filterChartsBySearch,
  filterFavoritesOnly,
  applyFilters,
  formatBirthDate,
  formatBirthTime,
  getRelativeTime,
  groupChartsByMonth,
  getChartStats,
  toListItem,
} from '@/services/savedChartService'
import type { SavedChartListItem, SavedChart } from '@/types/savedChart.types'

// Mock data
const mockCharts: SavedChartListItem[] = [
  {
    id: '1',
    name: 'John Doe',
    birthDate: '1990-01-15T10:30:00Z',
    birthTime: '10:30',
    birthPlace: 'New York, USA',
    isFavorite: true,
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    birthDate: '1995-06-20T14:00:00Z',
    birthTime: '14:00',
    birthPlace: 'London, UK',
    isFavorite: false,
    createdAt: '2025-01-19T15:00:00Z',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    birthDate: '1988-03-10T08:15:00Z',
    birthTime: '08:15',
    birthPlace: 'Delhi, India',
    isFavorite: true,
    createdAt: '2025-01-18T12:00:00Z',
  },
]

describe('savedChartService', () => {
  describe('sortCharts', () => {
    it('should sort by created date descending (newest first)', () => {
      const sorted = sortCharts(mockCharts, 'created_desc')

      expect(sorted[0]!.id).toBe('1')
      expect(sorted[1]!.id).toBe('2')
      expect(sorted[2]!.id).toBe('3')
    })

    it('should sort by created date ascending (oldest first)', () => {
      const sorted = sortCharts(mockCharts, 'created_asc')

      expect(sorted[0]!.id).toBe('3')
      expect(sorted[1]!.id).toBe('2')
      expect(sorted[2]!.id).toBe('1')
    })

    it('should sort by name alphabetically', () => {
      const sorted = sortCharts(mockCharts, 'name_asc')

      expect(sorted[0]!.name).toBe('Alice Johnson')
      expect(sorted[1]!.name).toBe('Jane Smith')
      expect(sorted[2]!.name).toBe('John Doe')
    })

    it('should sort by birth date descending', () => {
      const sorted = sortCharts(mockCharts, 'birth_date_desc')

      expect(sorted[0]!.id).toBe('2') // 1995
      expect(sorted[1]!.id).toBe('1') // 1990
      expect(sorted[2]!.id).toBe('3') // 1988
    })

    it('should not mutate original array', () => {
      const original = [...mockCharts]
      sortCharts(mockCharts, 'name_asc')

      expect(mockCharts).toEqual(original)
    })
  })

  describe('filterChartsBySearch', () => {
    it('should filter by name (case insensitive)', () => {
      const filtered = filterChartsBySearch(mockCharts, 'john')

      expect(filtered).toHaveLength(2)
      expect(filtered.map((c) => c.id)).toContain('1')
      expect(filtered.map((c) => c.id)).toContain('3')
    })

    it('should filter by location (case insensitive)', () => {
      const filtered = filterChartsBySearch(mockCharts, 'delhi')

      expect(filtered).toHaveLength(1)
      expect(filtered[0]!.id).toBe('3')
    })

    it('should return all charts when search is empty', () => {
      const filtered = filterChartsBySearch(mockCharts, '')

      expect(filtered).toHaveLength(3)
    })

    it('should return all charts when search is whitespace', () => {
      const filtered = filterChartsBySearch(mockCharts, '   ')

      expect(filtered).toHaveLength(3)
    })

    it('should return empty array when no matches', () => {
      const filtered = filterChartsBySearch(mockCharts, 'xyz123')

      expect(filtered).toHaveLength(0)
    })
  })

  describe('filterFavoritesOnly', () => {
    it('should return only favorite charts', () => {
      const filtered = filterFavoritesOnly(mockCharts)

      expect(filtered).toHaveLength(2)
      expect(filtered[0]!.id).toBe('1')
      expect(filtered[1]!.id).toBe('3')
      expect(filtered.every((c) => c.isFavorite)).toBe(true)
    })

    it('should return empty array when no favorites', () => {
      const noFavorites = mockCharts.map((c) => ({ ...c, isFavorite: false }))
      const filtered = filterFavoritesOnly(noFavorites)

      expect(filtered).toHaveLength(0)
    })
  })

  describe('applyFilters', () => {
    it('should apply search filter only', () => {
      const filtered = applyFilters(mockCharts, {
        search: 'john',
        favoritesOnly: false,
        sortBy: 'created_desc',
      })

      expect(filtered).toHaveLength(2)
    })

    it('should apply favorites filter only', () => {
      const filtered = applyFilters(mockCharts, {
        search: '',
        favoritesOnly: true,
        sortBy: 'created_desc',
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.every((c) => c.isFavorite)).toBe(true)
    })

    it('should apply both filters and sorting', () => {
      const filtered = applyFilters(mockCharts, {
        search: 'john',
        favoritesOnly: true,
        sortBy: 'name_asc',
      })

      // Should match "john" AND be favorite = only Alice Johnson and John Doe
      expect(filtered).toHaveLength(2)
      expect(filtered[0]!.name).toBe('Alice Johnson') // Alphabetically first
    })

    it('should apply sorting last', () => {
      const filtered = applyFilters(mockCharts, {
        search: '',
        favoritesOnly: false,
        sortBy: 'name_asc',
      })

      expect(filtered[0]!.name).toBe('Alice Johnson')
      expect(filtered[2]!.name).toBe('John Doe')
    })
  })

  describe('formatBirthDate', () => {
    it('should format date to "15 January 1990"', () => {
      const formatted = formatBirthDate('1990-01-15T10:30:00Z')

      expect(formatted).toBe('15 January 1990')
    })

    it('should format date to "20 June 1995"', () => {
      const formatted = formatBirthDate('1995-06-20T14:00:00Z')

      expect(formatted).toBe('20 June 1995')
    })
  })

  describe('formatBirthTime', () => {
    it('should format "10:30" to "10:30 AM"', () => {
      const formatted = formatBirthTime('10:30')

      expect(formatted).toMatch(/10:30/)
      expect(formatted).toMatch(/am/i)
    })

    it('should format "14:00" to "2:00 PM"', () => {
      const formatted = formatBirthTime('14:00')

      expect(formatted).toMatch(/2:00/)
      expect(formatted).toMatch(/pm/i)
    })

    it('should format "00:00" to "12:00 AM"', () => {
      const formatted = formatBirthTime('00:00')

      expect(formatted).toMatch(/12:00/)
      expect(formatted).toMatch(/am/i)
    })
  })

  describe('getRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date().toISOString()
      const result = getRelativeTime(now)

      expect(result).toBe('just now')
    })

    it('should return "5m ago" for 5 minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const result = getRelativeTime(fiveMinutesAgo)

      expect(result).toBe('5m ago')
    })

    it('should return "2h ago" for 2 hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(twoHoursAgo)

      expect(result).toBe('2h ago')
    })

    it('should return "3d ago" for 3 days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(threeDaysAgo)

      expect(result).toBe('3d ago')
    })

    it('should return formatted date for dates older than a year', () => {
      const oldDate = '2020-01-15T10:30:00Z'
      const result = getRelativeTime(oldDate)

      expect(result).toBe('15 January 2020')
    })
  })

  describe('groupChartsByMonth', () => {
    it('should group charts by birth month', () => {
      const grouped = groupChartsByMonth(mockCharts)

      expect(grouped['January']).toHaveLength(1)
      expect(grouped['March']).toHaveLength(1)
      expect(grouped['June']).toHaveLength(1)
    })

    it('should handle multiple charts in same month', () => {
      const sameMonthCharts: SavedChartListItem[] = [
        { ...mockCharts[0]!, birthDate: '1990-01-15T10:30:00Z' },
        { ...mockCharts[1]!, birthDate: '1995-01-20T14:00:00Z' },
      ]

      const grouped = groupChartsByMonth(sameMonthCharts)

      expect(grouped['January']).toHaveLength(2)
    })
  })

  describe('getChartStats', () => {
    it('should calculate total count correctly', () => {
      const stats = getChartStats(mockCharts)

      expect(stats.total).toBe(3)
    })

    it('should calculate favorites count correctly', () => {
      const stats = getChartStats(mockCharts)

      expect(stats.favorites).toBe(2)
    })

    it('should handle empty array', () => {
      const stats = getChartStats([])

      expect(stats.total).toBe(0)
      expect(stats.favorites).toBe(0)
      expect(stats.thisMonth).toBe(0)
      expect(stats.thisYear).toBe(0)
    })
  })

  describe('toListItem', () => {
    it('should convert full chart to list item', () => {
      const fullChart: SavedChart = {
        id: '1',
        userId: 'user-123',
        name: 'Test Chart',
        birthDate: '1990-01-15T10:30:00Z',
        birthTime: '10:30',
        birthPlace: 'New York',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: '-5',
        chartData: { /* large object */ },
        isFavorite: true,
        isPublic: false,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      }

      const listItem = toListItem(fullChart)

      expect(listItem).toEqual({
        id: '1',
        name: 'Test Chart',
        birthDate: '1990-01-15T10:30:00Z',
        birthTime: '10:30',
        birthPlace: 'New York',
        isFavorite: true,
        createdAt: '2025-01-20T10:00:00Z',
      })
      expect(listItem).not.toHaveProperty('chartData')
      expect(listItem).not.toHaveProperty('userId')
    })
  })
})

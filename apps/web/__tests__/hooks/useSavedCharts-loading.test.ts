/**
 * Tests for useSavedCharts hook - Loading State for Favorite Toggle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSavedCharts } from '@/hooks/useSavedCharts'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useSavedCharts - Favorite Toggle Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock initial GET request for charts list
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        kundlis: [
          {
            id: 'chart-1',
            name: 'John Doe',
            birthDate: '1990-01-15T10:30:00Z',
            birthTime: '10:30',
            birthPlace: 'New York, USA',
            isFavorite: false,
            createdAt: '2025-01-20T10:00:00Z',
          },
          {
            id: 'chart-2',
            name: 'Jane Smith',
            birthDate: '1995-06-20T14:00:00Z',
            birthTime: '14:00',
            birthPlace: 'London, UK',
            isFavorite: true,
            createdAt: '2025-01-19T15:00:00Z',
          },
        ],
      }),
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should set loading state when toggling favorite', async () => {
    const { result } = renderHook(() => useSavedCharts())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock PATCH request for toggle
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isFavorite: true,
      }),
    })

    // Check initial state - not toggling
    expect(result.current.isTogglingFavorite('chart-1')).toBe(false)

    // Start toggle
    act(() => {
      result.current.toggleFavorite('chart-1')
    })

    // Check loading state is set immediately
    expect(result.current.isTogglingFavorite('chart-1')).toBe(true)

    // Wait for toggle to complete
    await waitFor(() => {
      expect(result.current.isTogglingFavorite('chart-1')).toBe(false)
    })
  })

  it('should prevent multiple simultaneous toggles for the same chart', async () => {
    const { result } = renderHook(() => useSavedCharts())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock PATCH request with delay
    let resolveFirstToggle: (value: unknown) => void
    const firstTogglePromise = new Promise((resolve) => {
      resolveFirstToggle = resolve
    })

    mockFetch.mockImplementationOnce(() => firstTogglePromise)

    // Start first toggle
    act(() => {
      result.current.toggleFavorite('chart-1')
    })

    // Verify loading state is set
    expect(result.current.isTogglingFavorite('chart-1')).toBe(true)

    // Count fetch calls before second toggle
    const fetchCallsBefore = mockFetch.mock.calls.length

    // Try to toggle again (should be prevented)
    act(() => {
      result.current.toggleFavorite('chart-1')
    })

    // Verify no additional fetch call was made
    expect(mockFetch.mock.calls.length).toBe(fetchCallsBefore)

    // Still loading
    expect(result.current.isTogglingFavorite('chart-1')).toBe(true)

    // Resolve first toggle
    resolveFirstToggle!({
      ok: true,
      json: async () => ({
        success: true,
        isFavorite: true,
      }),
    })

    // Wait for toggle to complete
    await waitFor(() => {
      expect(result.current.isTogglingFavorite('chart-1')).toBe(false)
    })
  })

  it('should clear loading state on successful toggle', async () => {
    const { result } = renderHook(() => useSavedCharts())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock successful PATCH request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isFavorite: true,
      }),
    })

    // Toggle favorite
    await act(async () => {
      await result.current.toggleFavorite('chart-1')
    })

    // Verify loading state is cleared
    expect(result.current.isTogglingFavorite('chart-1')).toBe(false)

    // Verify chart state was updated
    const chart = result.current.allCharts.find((c) => c.id === 'chart-1')
    expect(chart?.isFavorite).toBe(true)
  })

  it('should clear loading state on error', async () => {
    const { result } = renderHook(() => useSavedCharts())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock failed PATCH request
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to toggle favorite',
      }),
    })

    // Mock the refetch (error triggers refetch) with delay to capture error state
    let resolveRefetch: (value: unknown) => void
    const refetchPromise = new Promise((resolve) => {
      resolveRefetch = resolve
    })
    mockFetch.mockImplementationOnce(() => refetchPromise)

    // Toggle favorite (don't await to capture intermediate state)
    act(() => {
      result.current.toggleFavorite('chart-1')
    })

    // Wait for error to be set (before refetch completes)
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    // Verify loading state is cleared even after error
    expect(result.current.isTogglingFavorite('chart-1')).toBe(false)

    // Now resolve the refetch to clean up
    resolveRefetch!({
      ok: true,
      json: async () => ({
        success: true,
        kundlis: result.current.allCharts,
      }),
    })

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should allow toggling different charts simultaneously', async () => {
    const { result } = renderHook(() => useSavedCharts())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock PATCH requests for both charts
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isFavorite: true,
      }),
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isFavorite: false,
      }),
    })

    // Toggle two different charts
    act(() => {
      result.current.toggleFavorite('chart-1')
      result.current.toggleFavorite('chart-2')
    })

    // Both should be loading
    expect(result.current.isTogglingFavorite('chart-1')).toBe(true)
    expect(result.current.isTogglingFavorite('chart-2')).toBe(true)

    // Wait for both to complete
    await waitFor(() => {
      expect(result.current.isTogglingFavorite('chart-1')).toBe(false)
      expect(result.current.isTogglingFavorite('chart-2')).toBe(false)
    })

    // Verify both API calls were made
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('chart-1'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('chart-2'),
      expect.any(Object)
    )
  })

  it('should handle rapid clicks - only one API call per chart', async () => {
    const { result } = renderHook(() => useSavedCharts())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock PATCH request
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        isFavorite: true,
      }),
    })

    const initialFetchCount = mockFetch.mock.calls.length

    // Rapid clicks on same chart (5 times)
    act(() => {
      result.current.toggleFavorite('chart-1')
      result.current.toggleFavorite('chart-1')
      result.current.toggleFavorite('chart-1')
      result.current.toggleFavorite('chart-1')
      result.current.toggleFavorite('chart-1')
    })

    // Wait for toggle to complete
    await waitFor(() => {
      expect(result.current.isTogglingFavorite('chart-1')).toBe(false)
    })

    // Only one additional API call should have been made
    // (initial load + 1 toggle, not 5)
    expect(mockFetch.mock.calls.length).toBe(initialFetchCount + 1)
  })
})

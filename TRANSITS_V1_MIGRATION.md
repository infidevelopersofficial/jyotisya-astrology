# Transits API v1 Migration Guide

**Date**: 2026-02-01
**Status**: In Progress
**Endpoint**: `POST|GET /api/v1/astrology/transits`

---

## Overview

The Planetary Transits (Gochar) endpoint has been migrated to the v1 API architecture. It now features a **Hybrid Calculation Strategy**:
1.  **Data Fetching**: High-precision planetary positions (Natal + Transit) are fetched from external sources (Python Service or FreeAstrologyAPI) via the orchestrator.
2.  **Analysis**: Aspect analysis (effects, interpretation) is performed locally using reusable business logic.

This approach ensures strict astronomical accuracy (e.g., matching Swiss Ephemeris) while maintaining full control over interpretation logic.

---

## What's New

### 1. Hybrid Orchestration
- Uses `getBirthChart` twice (once for birth, once for target date) to get precise positions.
- Falls back automatically to FreeAstrologyAPI if the Python service is unavailable.
- Tracks sources as `python+python`, `python+freeastrology`, etc.

### 2. Redis-Based Caching
- **TTL**: 6 hours (Transits change slowly).
- **Key**: Includes birth date, target date (rounded to hour), and location.

### 3. Dual HTTP Methods
- `POST` for JSON bodies.
- `GET` for URL parameters (easier for frontend fetching).

### 4. Standardized Response
```json
{
  "success": true,
  "data": {
    "transitTime": "2026-02-01T00:00:00.000Z",
    "currentPositions": { "Sun": 280.5, ... },
    "activeTransits": [
      {
        "transitPlanet": "Jupiter",
        "natalPlanet": "Sun",
        "aspect": "trine",
        "nature": "harmonious",
        "effect": "Growth opportunities..."
      }
    ],
    "summary": { "overallTone": "favorable", ... }
  },
  "meta": {
    "source": "python+python",
    "cached": false
  }
}
```

---

## API Usage

### POST Request
```bash
curl -X POST /api/v1/astrology/transits \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "1990-01-15T10:30:00Z",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone": 5.5
  }'
```

### GET Request
```bash
curl "/api/v1/astrology/transits?dateTime=1990-01-15T10:30:00Z&latitude=28.6139&longitude=77.209&timezone=5.5"
```

# Divisional Charts API v1 Migration Guide

**Date**: 2026-02-01  
**Status**: ✅ Completed  
**Endpoint**: `POST|GET /api/v1/astrology/divisional-charts`

---

## Overview

The Divisional Charts (Varga) endpoint has been migrated to the v1 API architecture, providing comprehensive support for D1-D60 Vedic divisional charts with Redis-based caching, service orchestration, and automatic failover.

---

## What's New

### 1. Service Orchestrator Integration
- Uses `astrologyOrchestrator.getDivisionalChart()` for automatic failover
- Falls back to FreeAstrologyAPI if Python service is unavailable
- Source tracking via `X-Service-Source` header

### 2. Comprehensive Chart Support
Supports all 16 standard Vedic divisional charts:
- **D1** (Rasi) - Body, physical matters
- **D2** (Hora) - Wealth, assets
- **D3** (Drekkana) - Siblings, courage
- **D4** (Chaturthamsa) - Fortune, property
- **D7** (Saptamsa) - Children, progeny
- **D9** (Navamsa) - Marriage, dharma
- **D10** (Dasamsa) - Career, profession
- **D12** (Dwadasamsa) - Parents, lineage
- **D16** (Shodasamsa) - Vehicles, comforts
- **D20** (Vimsamsa) - Spiritual progress
- **D24** (Chaturvimsamsa) - Education, learning
- **D27** (Saptavimsamsa) - Strength, vitality
- **D30** (Trimsamsa) - Misfortunes, evils
- **D40** (Khavedamsa) - Auspicious effects
- **D45** (Akshavedamsa) - General character
- **D60** (Shashtyamsa) - General results

### 3. Redis-Based Caching
- 24-hour cache TTL (divisional charts don't change)
- Cache key includes: chart type, date, time, location
- Graceful degradation when cache is unavailable
- Cache hit/miss logging for monitoring

### 4. Dual HTTP Methods
- `POST` - For programmatic access with JSON body
- `GET` - For simple queries via URL parameters

### 5. Enhanced Validation
- Zod schema validation for all inputs
- Date format validation (ISO 8601)
- Coordinate range validation
- Chart type enum validation
- NaN detection for numeric parameters

---

## API Usage

### POST Request

```bash
curl -X POST http://localhost:3000/api/v1/astrology/divisional-charts \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "1990-01-15T10:30:00Z",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone": 5.5,
    "chartType": "D9"
  }'
```

### GET Request

```bash
curl "http://localhost:3000/api/v1/astrology/divisional-charts?dateTime=1990-01-15T10:30:00Z&latitude=28.6139&longitude=77.209&timezone=5.5&chartType=D9"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "chartType": "D9",
    "planets": [
      {
        "name": "Ascendant",
        "fullDegree": 285.5,
        "normDegree": 15.5,
        "sign": "Capricorn",
        "signLord": "Saturn",
        "nakshatra": "Uttara Ashadha",
        "nakshatraLord": "Sun",
        "house": 1,
        "isRetro": false,
        "isCombust": false
      }
    ],
    "ascendant": 285.5
  },
  "meta": {
    "source": "python",
    "timestamp": "2026-02-01T08:30:00.000Z",
    "cached": false
  }
}
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Client Request                         │
│  POST /api/v1/astrology/divisional      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  withRouteHandler                       │
│  - Request ID generation                │
│  - Error handling                       │
│  - Performance tracking                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Zod Validation                         │
│  - Date format (ISO 8601)               │
│  - Chart type enum (D1-D60)             │
│  - Coordinate ranges                    │
│  - NaN detection                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  DivisionalChartsOrchestrator           │
│  - Check cache (24h TTL)                │
│  - Generate cache key                   │
│  - Call AstrologyOrchestrator           │
│  - Store result in cache                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  AstrologyOrchestrator                  │
│  - Try Python service first             │
│  - Fallback to FreeAstrologyAPI         │
│  - Circuit breaker protection           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Response                               │
│  - Formatted chart data                 │
│  - Source metadata                      │
│  - Cache headers                        │
└─────────────────────────────────────────┘
```

---

## Files Created

1. `lib/orchestrators/divisional-charts.orchestrator.ts` - Orchestrator with caching
2. `app/api/v1/astrology/divisional-charts/route.ts` - API route with OpenAPI docs
3. `__tests__/api/v1/astrology/divisional-charts.test.ts` - Comprehensive test suite
4. `DIVISIONAL_CHARTS_V1_MIGRATION.md` - This documentation

---

## Testing

### Run Tests

```bash
npm test -- __tests__/api/v1/astrology/divisional-charts.test.ts
```

### Test Coverage

- ✅ Valid POST request handling for all chart types
- ✅ Valid GET request handling
- ✅ Cache hit/miss scenarios
- ✅ Validation error for invalid chart type
- ✅ Validation error for missing fields
- ✅ Validation error for out-of-range coordinates
- ✅ Validation error for invalid dateTime format
- ✅ NaN detection for query parameters
- ✅ Fallback to FreeAstrologyAPI
- ✅ Service error handling

---

## Migration from Legacy API

### Old Endpoint (Legacy)
```
POST /api/astrology/divisional-charts
```

### New Endpoint (v1)
```
POST /api/v1/astrology/divisional-charts
GET  /api/v1/astrology/divisional-charts
```

### Breaking Changes

| Aspect | Legacy | v1 |
|--------|--------|-----|
| Response wrapper | Direct data | `{ success, data, meta }` |
| Error format | `{ error, message }` | `{ success: false, error: { code, message } }` |
| Source tracking | None | `X-Service-Source` header |
| Cache headers | None | `Cache-Control: max-age=86400` |
| Caching | None | 24-hour Redis cache |

---

## Performance

- **Cache Hit**: ~5ms response time
- **Cache Miss**: ~200-500ms (depending on backend)
- **Cache TTL**: 24 hours
- **Cache Key**: `divisional:{chartType}:{date}:{time}:{lat}:{lng}:{tz}`

---

## Monitoring

### Logs
- Cache hit/miss events
- Service fallback events
- Validation errors
- Performance metrics

### Sentry
- Service errors with context
- Invalid chart type attempts
- Cache failures

### Headers
- `X-Service-Source`: `python` | `freeastrology`
- `X-Cached`: `true` | `false`
- `X-Request-ID`: Unique request identifier

---

## Next Steps

1. **Deploy to Staging**
   ```bash
   ./scripts/deploy-staging.sh
   ```

2. **Run Smoke Tests**
   ```bash
   ./scripts/smoke-tests.sh https://staging-url.vercel.app
   ```

3. **Update Client Code**
   - Migrate frontend components from `/api/astrology/divisional-charts` to `/api/v1/astrology/divisional-charts`
   - Update response parsing for new wrapper format
   - Add support for cache headers

4. **Monitor**
   - Check Sentry for errors
   - Verify cache hit rates
   - Monitor service fallback frequency

---

## Related Documentation

- [PANCHANG_V1_MIGRATION.md](PANCHANG_V1_MIGRATION.md) - Panchang API migration
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [NEXT_STEPS.md](NEXT_STEPS.md) - API roadmap

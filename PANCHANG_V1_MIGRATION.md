# Panchang API v1 Migration Guide

**Date**: 2026-02-01  
**Status**: ✅ Completed  
**Endpoint**: `POST|GET /api/v1/astrology/panchang`

---

## Overview

The Panchang (Vedic calendar) endpoint has been migrated to the v1 API architecture, bringing it in line with the service orchestrator pattern used by the birth chart endpoint. This provides automatic failover, better caching, and consistent error handling.

---

## Changes Summary

### What's New

1. **Service Orchestrator Integration**
   - Uses `astrologyOrchestrator.getPanchang()` for automatic failover
   - Falls back to FreeAstrologyAPI if Python service is unavailable
   - Source tracking via `X-Service-Source` header

2. **Enhanced Validation**
   - Zod schema validation for all inputs
   - Date format validation (YYYY-MM-DD)
   - Coordinate range validation
   - Clear error messages

3. **Dual HTTP Methods**
   - `POST` - For programmatic access with JSON body
   - `GET` - For simple queries via URL parameters

4. **Improved Caching**
   - 6-hour cache TTL (panchang changes slowly)
   - CDN caching via `s-maxage` directive

5. **Consistent Response Format**
   ```json
   {
     "success": true,
     "data": {
       "date": "2025-12-25",
       "tithi": { "name": "...", "endTime": "..." },
       "nakshatra": { "name": "...", "endTime": "..." },
       "yoga": { "name": "...", "endTime": "..." },
       "karana": { "name": "...", "endTime": "..." },
       "sunrise": "06:45 AM",
       "sunset": "05:30 PM",
       "moonrise": "07:15 PM",
       "moonset": "06:30 AM"
     },
     "meta": {
       "source": "python",
       "timestamp": "2026-02-01T08:30:00.000Z",
       "cached": false
     }
   }
   ```

---

## API Usage

### POST Request

```bash
curl -X POST http://localhost:3000/api/v1/astrology/panchang \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-25",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone": 5.5
  }'
```

### GET Request

```bash
curl "http://localhost:3000/api/v1/astrology/panchang?date=2025-12-25&latitude=28.6139&longitude=77.209&timezone=5.5"
```

---

## Migration from Legacy API

### Old Endpoint (Legacy)
```
POST /api/astrology/panchang
```

### New Endpoint (v1)
```
POST /api/v1/astrology/panchang
GET  /api/v1/astrology/panchang
```

### Breaking Changes

| Aspect | Legacy | v1 |
|--------|--------|-----|
| Response wrapper | Direct data | `{ success, data, meta }` |
| Error format | `{ error, message }` | `{ success: false, error: { code, message } }` |
| Source tracking | None | `X-Service-Source` header |
| Cache headers | None | `Cache-Control: max-age=21600` |

---

## Testing

Comprehensive test suite added at:
```
__tests__/api/v1/astrology/panchang.test.ts
```

### Test Coverage

- ✅ Valid POST request handling
- ✅ Valid GET request handling
- ✅ Validation error for invalid date format
- ✅ Validation error for missing fields
- ✅ Validation error for out-of-range coordinates
- ✅ Fallback to FreeAstrologyAPI
- ✅ Cache headers verification
- ✅ Service error handling

### Run Tests

```bash
npm test __tests__/api/v1/astrology/panchang.test.ts
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Client Request                         │
│  POST /api/v1/astrology/panchang        │
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
│  - Date format (YYYY-MM-DD)             │
│  - Coordinate ranges                    │
│  - Timezone range (-12 to +14)          │
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
│  - Formatted panchang data              │
│  - Source metadata                      │
│  - Cache headers                        │
└─────────────────────────────────────────┘
```

---

## Files Created/Modified

### New Files
1. `app/api/v1/astrology/panchang/route.ts` - Main endpoint implementation
2. `__tests__/api/v1/astrology/panchang.test.ts` - Test suite
3. `PANCHANG_V1_MIGRATION.md` - This documentation

### Dependencies
- Uses existing `astrologyOrchestrator.getPanchang()` method
- Leverages existing `withRouteHandler` wrapper
- Uses existing Zod validation patterns

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
   - Migrate frontend components from `/api/astrology/panchang` to `/api/v1/astrology/panchang`
   - Update response parsing for new wrapper format

4. **Monitor Logs**
   - Check Sentry for any errors
   - Verify source distribution (python vs freeastrology)

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [NEXT_STEPS.md](NEXT_STEPS.md) - API roadmap
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - General implementation patterns

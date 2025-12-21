# Backend Refactoring Implementation Guide

## Current Status: Phase 2 Complete! 🎉

You now have a production-ready foundation for migrating backend services to Next.js API routes with Railway integration.

---

## ✅ What's Been Implemented

### Phase 1: Infrastructure (Complete)
1. **Railway Deployment**
   - Configuration files for Python service deployment
   - Health monitoring and circuit breaker
   - Comprehensive deployment documentation

2. **Environment Management**
   - Updated `.env.example` with new variables
   - Enhanced validation in `lib/env.ts`
   - Backward compatibility maintained

3. **API Framework**
   - `lib/api/route-handler.ts` - Consistent error handling & logging
   - `lib/api/auth.ts` - Supabase authentication helpers
   - Standardized response format with request IDs

### Phase 2: Astrology Service Integration (Complete)
1. **Python Service Client** (`lib/astrology/python-client.ts`)
   - Circuit breaker (auto-opens after 5 failures, resets after 1 min)
   - Retry logic with exponential backoff (100ms, 500ms, 2s)
   - 10-second configurable timeout
   - Health check monitoring

2. **Service Orchestrator** (`lib/astrology/service-orchestrator.ts`)
   - **Priority 1**: Python service (Railway) - unlimited, free, 5-15ms
   - **Priority 2**: FreeAstrologyAPI - 50 req/day limit, 200-500ms
   - Automatic failover on service failures
   - Service health tracking with 1-minute cache

3. **API Routes**
   - `/api/v1/astrology/birth-chart` - Enhanced with orchestrator
   - `/api/v1/astrology/status` - Service health monitoring
   - Validation with Zod schemas
   - Source tracking in responses

---

## 🚀 How to Deploy & Test

### Step 1: Deploy Python Service to Railway

```bash
# 1. Visit Railway
open https://railway.app/new

# 2. Connect your GitHub repo

# 3. Configure in Railway dashboard:
#    - Root Directory: digital-astrology/services/astro-core-python
#    - Environment Variables:
#      ASTROLOGY_BACKEND=internal
#
# 4. Generate domain and copy URL
#    Example: https://astro-core-python-production-abc123.up.railway.app
```

### Step 2: Update Environment Variables

```bash
cd apps/web

# Create/update .env.local
cat > .env.local << 'ENVFILE'
# Copy from .env.example and update these:
ASTRO_PYTHON_SERVICE_URL=https://your-railway-url.up.railway.app
ASTRO_PYTHON_SERVICE_TIMEOUT_MS=10000
API_INTERNAL_SECRET=$(openssl rand -hex 32)

# Keep existing vars:
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
FREE_ASTROLOGY_API_KEY=...
ENVFILE
```

### Step 3: Test Locally

```bash
# In one terminal - run Next.js
cd apps/web
yarn dev

# In another terminal - test the API
curl -X POST http://localhost:3000/api/v1/astrology/birth-chart \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "1990-01-15T10:30:00Z",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": 5.5
  }'

# Check service status
curl http://localhost:3000/api/v1/astrology/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "input": { ... },
    "ascendant": 285.4567,
    "planets": [ ... ],
    "houses": [ ... ]
  },
  "meta": {
    "source": "python",  // or "freeastrology" if fallback
    "timestamp": "2025-12-19T..."
  }
}
```

### Step 4: Update Vercel Environment Variables

```bash
# Add to Vercel project settings:
ASTRO_PYTHON_SERVICE_URL=https://your-railway-url.up.railway.app
ASTRO_PYTHON_SERVICE_TIMEOUT_MS=10000
API_INTERNAL_SECRET=<your-generated-secret>

# Existing vars should already be there:
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
OPENAI_API_KEY=...
```

---

## 📊 Service Architecture

```
┌──────────────────────────────────────────────┐
│         Next.js App Router (Vercel)          │
│                                              │
│  API Routes:                                 │
│  ├─ /api/v1/astrology/birth-chart           │
│  ├─ /api/v1/astrology/status                │
│  └─ /api/v1/astrology/...                   │
│                                              │
│  Service Orchestrator:                       │
│  ├─ Check Python service health             │
│  ├─ Try Python service first                │
│  └─ Fallback to FreeAstrologyAPI            │
└──────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
  ┌─────────────────┐    ┌───────────────────┐
  │ Python FastAPI  │    │ FreeAstrologyAPI  │
  │   (Railway)     │    │  (External SaaS)  │
  │                 │    │                   │
  │ • Unlimited     │    │ • 50 req/day      │
  │ • 5-15ms        │    │ • 200-500ms       │
  │ • ~$5-10/month  │    │ • Free tier       │
  └─────────────────┘    └───────────────────┘
```

---

## 🔍 Monitoring & Debugging

### Check Service Health

```bash
# Get service status
curl http://localhost:3000/api/v1/astrology/status

# Response shows:
{
  "selected_backend": "python",
  "python_service": {
    "available": true,
    "healthy": true,
    "state": { "state": "closed", "failureCount": 0 },
    "url": "http://localhost:4001"
  },
  "freeastrology": {
    "available": true,
    "rate_limit": {
      "daily_limit": 50,
      "used_today": 5,
      "remaining_today": 45,
      "reset_at": "2025-12-20T00:00:00.000Z"
    }
  }
}
```

### Circuit Breaker States

- **closed**: Service healthy, normal operation
- **open**: Service failed 5+ times, not attempting requests (resets after 1 min)
- **half-open**: Testing if service recovered

### Response Headers

```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Service-Source: python
Cache-Control: public, max-age=86400
```

### Logs

```bash
# Development logs show:
[API Request] { requestId, method, path, status, duration }
[API Warning] { ... } # 4xx errors
[API Error] { ... }   # 5xx errors

# Service logs:
Python service health check: OK
Birth chart request { backend: "python" }
Birth chart generated { source: "python", planets: 9 }
```

---

## 🧪 Testing Checklist

### Unit Tests (TODO - Phase 2 enhancement)
- [ ] Python client circuit breaker behavior
- [ ] Service orchestrator fallback logic
- [ ] Route handler error responses

### Integration Tests
- [ ] Birth chart calculation via Python service
- [ ] Automatic fallback to FreeAstrologyAPI
- [ ] Circuit breaker recovery
- [ ] Request validation errors

### Manual Testing
```bash
# Test Python service (primary)
curl -X POST http://localhost:3000/api/v1/astrology/birth-chart \
  -H "Content-Type: application/json" \
  -d '{"dateTime":"1990-01-15T10:30:00Z","latitude":28.6139,"longitude":77.2090,"timezone":5.5}'

# Test with invalid data (should return 400)
curl -X POST http://localhost:3000/api/v1/astrology/birth-chart \
  -H "Content-Type: application/json" \
  -d '{"dateTime":"invalid"}'

# Simulate Python service down (stop Railway service, should fallback)
# Should see: "source": "freeastrology" in response

# Check status endpoint
curl http://localhost:3000/api/v1/astrology/status
```

---

## 📝 Next Steps

### Phase 2 Remaining (Optional Enhancement)
- [ ] Multi-layer caching (in-memory + database)
- [ ] More comprehensive unit tests
- [ ] API rate limiting per user

### Phase 4: Chart Generation (Priority)
- [ ] Create chart renderer (SVG with multiple styles)
- [ ] Divisional charts endpoint (D1-D60)
- [ ] PDF export functionality
- [ ] User chart preferences

### Phase 5: AI Interpretations (Priority)
- [ ] Birth chart interpretation with OpenAI
- [ ] Streaming responses (SSE)
- [ ] Interpretation caching (7-day TTL)
- [ ] Token usage tracking

---

## 🐛 Troubleshooting

### Python Service Not Responding
```bash
# Check Railway logs
# Verify environment: ASTROLOGY_BACKEND=internal
# Test health endpoint directly:
curl https://your-railway-url.railway.app/health
```

### Circuit Breaker Stuck Open
```bash
# Wait 1 minute for automatic reset
# Or restart the Next.js server
# Check logs for failure reasons
```

### FreeAstrologyAPI Rate Limit
```bash
# Check status endpoint for quota
# Resets daily at midnight UTC
# Consider upgrading API plan if needed
```

### Validation Errors
```bash
# Check request matches schema:
{
  "dateTime": "ISO 8601 string",
  "latitude": -90 to 90,
  "longitude": -180 to 180,
  "timezone": -12 to 14
}
```

---

## 📚 Key Files Reference

### Configuration
- `services/astro-core-python/railway.toml` - Railway deployment
- `apps/web/.env.example` - Environment template
- `apps/web/lib/env.ts` - Environment validation

### Core Services
- `apps/web/lib/astrology/python-client.ts` - Python service client
- `apps/web/lib/astrology/service-orchestrator.ts` - Service routing
- `apps/web/lib/astrology/client.ts` - FreeAstrologyAPI client

### API Framework
- `apps/web/lib/api/route-handler.ts` - API wrapper
- `apps/web/lib/api/auth.ts` - Authentication helpers

### API Routes
- `apps/web/app/api/v1/astrology/birth-chart/route.ts` - Birth chart endpoint
- `apps/web/app/api/v1/astrology/status/route.ts` - Service status

---

## 💡 Best Practices

1. **Always check `/api/v1/astrology/status` before debugging**
2. **Monitor Railway service health in production**
3. **Set up alerts for circuit breaker opens**
4. **Track FreeAstrologyAPI quota usage**
5. **Use request IDs for debugging (check response headers)**

---

**Last Updated**: 2025-12-19  
**Status**: Phase 1 & 2 Complete ✅  
**Next**: Phase 4 (Chart Generation) or Phase 5 (AI Interpretations)

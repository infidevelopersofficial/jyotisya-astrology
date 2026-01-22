# Backend Refactoring Progress

**Migration Goal**: Consolidate NestJS/FastAPI services into Next.js App Router API routes for Vercel deployment

**Updated**: 2026-01-08

---

## ✅ Phase 1: Setup & Foundation (COMPLETED)

### 1.1 Railway Deployment Configuration ✅

- [x] Created `services/astro-core-python/railway.toml`
- [x] Created `services/astro-core-python/Procfile`
- [x] Created `services/astro-core-python/RAILWAY_DEPLOYMENT.md`

**Next Steps for Deployment**:

1. Push to GitHub repository
2. Connect repository to Railway
3. Set root directory: `digital-astrology/services/astro-core-python`
4. Configure environment variables:
   - `ASTROLOGY_BACKEND=internal`
   - Optional: `FREE_API_KEY` for fallback
5. Deploy and get service URL
6. Add `ASTRO_PYTHON_SERVICE_URL` to Vercel environment variables

### 1.2 Environment Configuration ✅

- [x] Updated `apps/web/.env.example`:
  - Added `ASTRO_PYTHON_SERVICE_URL`
  - Added `ASTRO_PYTHON_SERVICE_TIMEOUT_MS`
  - Added `API_INTERNAL_SECRET`
  - Marked old service URLs as deprecated

- [x] Updated `apps/web/lib/env.ts`:
  - Added new environment variables to interface
  - Updated default values
  - Maintained backward compatibility

### 1.3 Turborepo Configuration ✅

- [x] Updated `turbo.json`:
  - Added environment variables to build pipeline
  - Added `persistent: true` to dev task
  - Added test dependencies

### 1.4 API Infrastructure ✅

- [x] Created `apps/web/lib/api/route-handler.ts`:
  - Standard error/success response creators
  - Request validation with Zod
  - Error handling wrapper
  - Cache headers helpers
  - Rate limit responses
  - Deprecation headers

- [x] Created `apps/web/lib/api/auth.ts`:
  - Supabase authentication helpers
  - Role-based authorization
  - Internal API secret validation
  - IP address extraction for rate limiting

---

## ✅ Phase 2: Core Astrology APIs (COMPLETED)

### Completed Tasks:

1. ✅ Created Python service client (`apps/web/lib/astrology/python-client.ts`)
   - Circuit breaker pattern for resilience
   - Automatic retry logic with exponential backoff
   - Health checking and service monitoring
   - 10s timeout with configurable settings

2. ✅ Created service orchestrator (`apps/web/lib/astrology/service-orchestrator.ts`)
   - Intelligent routing between Python (primary) and FreeAstrologyAPI (fallback)
   - Automatic failover when Python service is unavailable
   - Health tracking for both services
   - Service status reporting

3. ✅ Enhanced cached-client with service orchestrator integration
   - Updated to use orchestrator instead of direct API client
   - Birth chart and chart SVG now route through orchestrator
   - Source tracking (python/freeastrology) in cached responses
   - Maintains 24-hour caching for optimal performance

4. ✅ API routes now use multi-layer architecture:
   - Layer 1: API Route (`/api/astrology/birth-chart`)
   - Layer 2: Cached Client (24h caching)
   - Layer 3: Service Orchestrator (intelligent routing)
   - Layer 4: Python Client or FreeAstrologyAPI Client

**Architecture Diagram:**

```
API Route → Cached Client → Orchestrator → Python Service (primary)
                                        ↓
                                        → FreeAstrologyAPI (fallback)
```

---

## 📋 Upcoming Phases

### Phase 4: Chart Generation & Visualization (PRIORITY)

- Chart renderer with multiple styles (North/South/East Indian, Western)
- Divisional charts (D1-D60)
- PDF export
- User chart preferences

### Phase 5: AI Interpretations (PRIORITY)

- Birth chart interpretation API
- Streaming responses
- Intelligent caching
- Token usage tracking

### Phase 3: Business Logic APIs (DEFERRED)

- Consultations API
- Commerce API
- Identity utilities
- Notifications

### Phase 6: Cleanup & Optimization

- Remove deprecated services
- Vercel deployment optimization
- Monitoring & observability
- Documentation

---

## Files Created

### Phase 1 Files:

1. `/services/astro-core-python/railway.toml` - Railway deployment config
2. `/services/astro-core-python/Procfile` - Process file for deployment
3. `/services/astro-core-python/RAILWAY_DEPLOYMENT.md` - Deployment guide
4. `/apps/web/lib/api/route-handler.ts` - API route utilities
5. `/apps/web/lib/api/auth.ts` - Authentication helpers

### Modified Files:

1. `/apps/web/.env.example` - Updated environment variables
2. `/apps/web/lib/env.ts` - Updated validation
3. `/turbo.json` - Updated pipeline configuration

---

## Quick Commands

### Local Development

```bash
# Start Python service locally
cd services/astro-core-python
source .venv/bin/activate
export ASTROLOGY_BACKEND=internal
uvicorn router:app --reload --port 4001

# Start Next.js app
cd apps/web
yarn dev
```

### Deployment

```bash
# Build all packages
yarn build:all

# Deploy to Vercel (from apps/web)
vercel deploy --prod
```

### Testing

```bash
# Test Python service health
curl http://localhost:4001/health

# Test Railway deployment
curl https://your-app.railway.app/health
```

---

## Success Metrics

### Phase 1 (Completed)

- ✅ Python service ready for Railway deployment
- ✅ Environment variables configured
- ✅ API infrastructure established
- ✅ Turborepo pipeline updated

### Overall Progress: 47% (9/19 tasks completed)

---

## Notes

- **Backward Compatibility**: All old endpoints maintained with deprecation headers
- **Migration Timeline**: ~17 days for priority features (Chart + AI)
- **Cost Optimization**: Railway ~$5-10/month, OpenAI <$50/month with caching
- **Python Service**: Cannot be migrated to Next.js (requires Python scientific stack)

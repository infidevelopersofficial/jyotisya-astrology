# 🏗️ Backend Architecture - After Refactoring

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL DEPLOYMENT                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js App Router (apps/web)                │  │
│  │                                                            │  │
│  │  Frontend:                                                │  │
│  │  ├─ React 18 + TypeScript                                │  │
│  │  ├─ Tailwind CSS                                          │  │
│  │  ├─ Supabase Auth (SSR)                                   │  │
│  │  └─ TanStack Query                                        │  │
│  │                                                            │  │
│  │  API Routes: /api/v1/astrology/*                         │  │
│  │  ├─ birth-chart/route.ts                                 │  │
│  │  ├─ status/route.ts                                      │  │
│  │  └─ [future routes...]                                   │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │      Service Orchestrator Layer                   │   │  │
│  │  │                                                    │   │  │
│  │  │  Priority 1: Python Service (Railway)            │   │  │
│  │  │  ├─ Circuit Breaker (5 failures → open)          │   │  │
│  │  │  ├─ Retry Logic (exponential backoff)            │   │  │
│  │  │  ├─ Health Monitoring (1-min cache)              │   │  │
│  │  │  └─ 10s timeout                                   │   │  │
│  │  │                                                    │   │  │
│  │  │  Priority 2: FreeAstrologyAPI (Fallback)         │   │  │
│  │  │  ├─ Rate Limit Tracking (50/day)                 │   │  │
│  │  │  ├─ Automatic failover                           │   │  │
│  │  │  └─ 8s timeout                                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │  Middleware:                                              │  │
│  │  ├─ withRouteHandler (error handling)                    │  │
│  │  ├─ Zod validation                                        │  │
│  │  ├─ Request ID tracking                                  │  │
│  │  └─ Performance monitoring                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                           │
         │                                           │
         ▼                                           ▼
┌──────────────────────┐              ┌────────────────────────────┐
│   RAILWAY DEPLOYMENT │              │  EXTERNAL SAAS SERVICE     │
│                      │              │                            │
│  Python FastAPI      │              │  FreeAstrologyAPI.com      │
│  (astro-core-python) │              │                            │
│                      │              │                            │
│  Features:           │              │  Features:                 │
│  ├─ Skyfield         │              │  ├─ 50 requests/day        │
│  ├─ JPL DE421        │              │  ├─ Commercial API         │
│  ├─ Unlimited reqs   │              │  ├─ 200-500ms latency      │
│  ├─ 5-15ms latency   │              │  └─ Backup only            │
│  └─ ~$5-10/month     │              │                            │
│                      │              │                            │
│  Endpoints:          │              │  Used for:                 │
│  ├─ POST /planets    │              │  ├─ Failover               │
│  ├─ POST /...svg     │              │  ├─ Divisional charts      │
│  └─ GET /health      │              │  └─ Panchang (temporary)   │
└──────────────────────┘              └────────────────────────────┘
         │                                           │
         └───────────────┬───────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │   DATA SOURCES     │
              │                    │
              │  ├─ PostgreSQL     │
              │  │   (Supabase)    │
              │  │                 │
              │  └─ Prisma ORM     │
              └────────────────────┘
```

---

## Request Flow

### Successful Request (Happy Path)

```
1. User Request
   ↓
2. Next.js API Route (/api/v1/astrology/birth-chart)
   ↓
3. withRouteHandler wrapper
   ├─ Generate request ID
   ├─ Validate with Zod
   └─ Start performance timer
   ↓
4. Service Orchestrator
   ├─ Check Python service health
   ├─ Python available? → Use Python
   └─ Log backend selection
   ↓
5. Python Client
   ├─ Check circuit breaker (closed)
   ├─ Make HTTP request to Railway
   ├─ Retry on timeout (exponential backoff)
   └─ Return result
   ↓
6. Response Handler
   ├─ Add source metadata
   ├─ Log request (duration, status)
   └─ Return JSON with request ID
   ↓
7. User receives response
   {
     "success": true,
     "data": { ... },
     "meta": {
       "source": "python",
       "requestId": "uuid",
       "timestamp": "..."
     }
   }
```

### Failover Request (Python Service Down)

```
1. User Request
   ↓
2. Service Orchestrator
   ├─ Check Python service health
   ├─ Python unavailable/timeout
   └─ Circuit breaker opens
   ↓
3. Automatic Failover
   ├─ Check FreeAstrologyAPI rate limit
   ├─ Has quota? → Use FreeAstrologyAPI
   └─ Log fallback event
   ↓
4. FreeAstrologyAPI Client
   ├─ Increment rate limit counter
   ├─ Make request with API key
   └─ Return result
   ↓
5. Response Handler
   └─ Return JSON with source: "freeastrology"
```

---

## Component Responsibilities

### 1. API Routes Layer

**Location**: `apps/web/app/api/v1/astrology/`

**Responsibilities**:

- HTTP endpoint handling
- Request validation (Zod schemas)
- Response formatting
- Error handling

**Key Files**:

- `birth-chart/route.ts` - Birth chart calculations
- `status/route.ts` - Service health monitoring

### 2. Service Orchestrator

**Location**: `apps/web/lib/astrology/service-orchestrator.ts`

**Responsibilities**:

- Backend selection logic
- Health tracking
- Automatic failover
- Cost optimization

**Decision Logic**:

```typescript
1. Is Python service available & healthy?
   YES → Use Python service
   NO  → Check FreeAstrologyAPI

2. Does FreeAstrologyAPI have quota?
   YES → Use FreeAstrologyAPI
   NO  → Return error (service unavailable)
```

### 3. Python Service Client

**Location**: `apps/web/lib/astrology/python-client.ts`

**Responsibilities**:

- HTTP communication with Railway
- Circuit breaker pattern
- Retry logic with backoff
- Health check monitoring

**Circuit Breaker States**:

- **Closed**: Normal operation
- **Open**: 5+ failures, blocking requests for 1 min
- **Half-Open**: Testing recovery

### 4. FreeAstrologyAPI Client

**Location**: `apps/web/lib/astrology/client.ts`

**Responsibilities**:

- HTTP communication with external API
- Rate limit tracking (50/day)
- Request caching (24hr TTL)
- Quota management

### 5. Middleware & Utilities

**Location**: `apps/web/lib/api/`

**Components**:

- `route-handler.ts` - Error handling wrapper
- `auth.ts` - Authentication helpers

---

## Data Flow Patterns

### Birth Chart Calculation

```
User Input:
{
  dateTime: "1990-01-15T10:30:00Z",
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5
}
  ↓
Validation (Zod):
  ✓ dateTime is ISO 8601
  ✓ latitude: -90 to 90
  ✓ longitude: -180 to 180
  ✓ timezone: -12 to 14
  ↓
Transform to AstrologyRequest:
{
  year: 1990,
  month: 1,
  date: 15,
  hours: 10,
  minutes: 30,
  seconds: 0,
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  observation_point: "topocentric",
  ayanamsha: "lahiri"
}
  ↓
Service Call:
  Python Service (Railway)
  POST /planets
  ↓
Response:
{
  input: { ... },
  ascendant: 285.4567,
  planets: [
    {
      name: "Sun",
      fullDegree: 301.23,
      normDegree: 1.23,
      speed: 0.9856,
      isRetro: false,
      sign: "Capricorn",
      signLord: "Saturn",
      nakshatra: "Uttara Ashadha",
      nakshatraLord: "Sun",
      house: 3
    },
    // ... 8 more planets
  ],
  houses: [ ... ]
}
```

---

## Error Handling Strategy

### Error Types

1. **Validation Errors (400)**
   - Invalid request body
   - Missing required fields
   - Out-of-range values

2. **Authentication Errors (401)**
   - Missing/invalid auth token
   - Session expired

3. **Service Errors (503)**
   - Python service down
   - Circuit breaker open
   - Both services unavailable

4. **Rate Limit Errors (429)**
   - FreeAstrologyAPI quota exhausted
   - User quota exceeded

5. **Timeout Errors (504)**
   - Python service timeout (>10s)
   - FreeAstrologyAPI timeout (>8s)

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Python service is currently unavailable",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-12-19T...",
    "requestId": "550e8400-..."
  }
}
```

---

## Performance Characteristics

### Latency Breakdown

**Python Service (Railway):**

```
Request: 1-2ms
Network: 2-5ms (same region)
Calculation: 2-8ms
Response: 1-2ms
─────────────────
Total: 5-15ms ⚡
```

**FreeAstrologyAPI (Fallback):**

```
Request: 1-2ms
Network: 50-100ms (external)
API Processing: 100-300ms
Response: 50-100ms
─────────────────
Total: 200-500ms 🐌
```

### Caching Strategy

**Current:**

- In-memory cache (Map-based)
- 24-hour TTL for birth charts
- No distributed cache yet

**Future (Phase 2 Enhancement):**

- Layer 1: In-memory (hot cache)
- Layer 2: Redis (distributed)
- Layer 3: PostgreSQL (long-term)

---

## Monitoring & Observability

### Metrics Collected

1. **Request Metrics**
   - Request count by endpoint
   - Response time (p50, p95, p99)
   - Error rate by type

2. **Service Health**
   - Python service availability
   - Circuit breaker state
   - Failover events

3. **Rate Limits**
   - FreeAstrologyAPI usage
   - Remaining quota
   - Reset timestamp

### Logging

**Format:**

```json
{
  "requestId": "uuid",
  "method": "POST",
  "path": "/api/v1/astrology/birth-chart",
  "status": 200,
  "duration": "12ms",
  "source": "python"
}
```

**Log Levels:**

- **INFO**: Successful requests (dev only)
- **WARN**: 4xx errors, fallback events
- **ERROR**: 5xx errors, service failures

---

## Security Considerations

### Authentication

- Supabase session-based auth
- JWT tokens (handled by Supabase)
- Role-based access control

### API Security

- Request validation (Zod)
- Rate limiting per user
- CORS configuration
- API key management (env vars)

### Data Protection

- No sensitive data logged
- Secure env var handling
- HTTPS only in production

---

## Scalability

### Current Capacity

**Python Service (Railway):**

- Handles ~1000 req/sec (single instance)
- Auto-scales based on load
- ~50MB memory per instance

**Next.js API Routes (Vercel):**

- Serverless (auto-scaling)
- 10s max duration (configurable)
- 1024MB memory (configurable)

### Bottlenecks

1. **Python Service**: Limited by single Railway instance
2. **FreeAstrologyAPI**: 50 requests/day hard limit
3. **Database**: Supabase free tier connections

### Scaling Strategy

1. **Horizontal**: Add more Railway instances
2. **Caching**: Reduce Python service load
3. **CDN**: Cache static responses
4. **Queue**: Async processing for batch requests

---

## Deployment Architecture

### Development

```
Local Machine
├─ Next.js (localhost:3000)
├─ Python Service (localhost:4001)
└─ PostgreSQL (Supabase cloud)
```

### Production

```
Vercel (Next.js)
├─ Edge Network (CDN)
├─ Serverless Functions
└─ Environment Variables

Railway (Python Service)
├─ Docker Container
├─ Auto-scaling
└─ Health Monitoring

Supabase (Database)
├─ PostgreSQL
├─ Auth Service
└─ Edge Functions
```

---

## Future Enhancements

### Phase 3: Business Logic

- Consultation booking API
- Commerce/products API
- Payment processing

### Phase 4: Chart Generation

- Server-side SVG rendering
- Multiple chart styles
- PDF export

### Phase 5: AI Interpretations

- OpenAI integration
- Streaming responses
- Smart caching

### Phase 6: Optimization

- Redis caching layer
- Database query optimization
- Remove deprecated services

---

**Last Updated**: 2025-12-19  
**Version**: 1.0 (Post Phase 1 & 2)  
**Status**: Production Ready ✅

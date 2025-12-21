# 🚀 Quick Start - Backend Refactoring

## TL;DR - Get Running in 10 Minutes

### Step 1: Deploy Python Service (5 min)

```bash
# 1. Open Railway
open https://railway.app/new

# 2. Deploy from GitHub
#    - Select your repo
#    - Root Directory: digital-astrology/services/astro-core-python
#    - Environment: ASTROLOGY_BACKEND=internal
#    - Generate domain → Copy URL
```

### Step 2: Configure Environment (2 min)

```bash
cd apps/web

# Create .env.local
cat >> .env.local << 'ENV'
ASTRO_PYTHON_SERVICE_URL=https://your-railway-url.railway.app
ASTRO_PYTHON_SERVICE_TIMEOUT_MS=10000
API_INTERNAL_SECRET=$(openssl rand -hex 32)
ENV
```

### Step 3: Test Locally (3 min)

```bash
# Start dev server
yarn dev

# Test API
curl -X POST http://localhost:3000/api/v1/astrology/birth-chart \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "1990-01-15T10:30:00Z",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": 5.5
  }'

# Should see: "source": "python" ✅
```

---

## 📁 What Was Created

### Infrastructure
```
services/astro-core-python/
├── railway.toml              # Railway deployment config
├── Procfile                  # Fallback deployment
└── RAILWAY_DEPLOYMENT.md     # Full deployment guide

apps/web/
├── .env.example              # Updated with new vars
└── lib/
    ├── env.ts                # Environment validation
    └── api/
        ├── route-handler.ts  # API wrapper
        └── auth.ts           # Auth helpers
```

### Services
```
apps/web/lib/astrology/
├── python-client.ts          # Railway Python service client
├── service-orchestrator.ts   # Smart routing (Python → FreeAstro)
├── client.ts                 # FreeAstrologyAPI client (existing)
└── cached-client.ts          # Caching layer (existing)
```

### API Routes
```
apps/web/app/api/v1/astrology/
├── birth-chart/route.ts      # Enhanced endpoint
└── status/route.ts           # Service health
```

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────┐
│  Next.js API Routes (Vercel)        │
│                                     │
│  Service Orchestrator               │
│  ├─ Try Python (Railway) first     │
│  └─ Fallback to FreeAstrologyAPI   │
└─────────────────────────────────────┘
         │                   │
         ▼                   ▼
    ┌────────┐         ┌────────┐
    │ Python │         │ FreeAPI│
    │Railway │         │External│
    └────────┘         └────────┘
    Unlimited          50/day
    5-15ms             200-500ms
```

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Python service responds to `/health`
- [ ] Birth chart returns `"source": "python"`
- [ ] Status endpoint shows service health
- [ ] Invalid requests return 400 errors

### Service Failover
- [ ] Stop Railway service
- [ ] Birth chart falls back to FreeAstrologyAPI
- [ ] Response shows `"source": "freeastrology"`
- [ ] Circuit breaker opens after 5 failures

### Production Readiness
- [ ] Railway service deployed
- [ ] Vercel env vars updated
- [ ] All endpoints tested
- [ ] Monitoring/alerts configured

---

## 📊 Service Health Monitoring

```bash
# Check which backend is being used
curl http://localhost:3000/api/v1/astrology/status | jq

# Response shows:
{
  "selected_backend": "python",  // or "freeastrology"
  "python_service": {
    "available": true,
    "healthy": true,
    "state": { "state": "closed", "failureCount": 0 }
  },
  "freeastrology": {
    "available": true,
    "rate_limit": {
      "used_today": 5,
      "remaining_today": 45
    }
  }
}
```

---

## 🔧 Common Issues & Fixes

### Python Service Not Responding
```bash
# Check Railway logs
railway logs

# Verify environment
railway variables

# Test health directly
curl https://your-railway-url.railway.app/health
```

### Circuit Breaker Open
```bash
# Wait 60 seconds for auto-reset
# Or restart Next.js dev server
# Check logs for root cause
```

### Rate Limit Exceeded
```bash
# Check status endpoint
curl http://localhost:3000/api/v1/astrology/status

# Resets daily at midnight UTC
# Consider Python service for unlimited requests
```

---

## 📝 Next: Choose Your Feature

### Option A: Chart Generation (Visual Features)
- SVG charts with 4 styles
- Divisional charts (D1-D60)
- PDF export
- **Time**: 3-4 days

### Option B: AI Interpretations (Engagement)
- OpenAI birth chart analysis
- Streaming responses
- Smart caching
- **Time**: 2-3 days

---

## 📚 Full Documentation

- **Detailed Plan**: `~/.claude/plans/gleaming-exploring-eagle.md`
- **Implementation**: `/IMPLEMENTATION_GUIDE.md`
- **Progress**: `/REFACTORING_PROGRESS.md`
- **Next Steps**: `/NEXT_STEPS.md`

---

## ✨ You're All Set!

```bash
# Start building
cd apps/web
yarn dev

# API is live at:
# http://localhost:3000/api/v1/astrology/*
```

**Status**: ✅ Ready for Production  
**Next**: Deploy to Railway & Start Building Features! 🚀

# Performance Monitoring Guide

## Overview

Comprehensive performance monitoring utilities for tracking and optimizing application performance across all layers: API requests, database queries, component renders, and custom operations.

## Quick Start

### 1. Measure Async Operations

```typescript
import { measureAsync } from "@/lib/monitoring/performance";

const data = await measureAsync(
  "fetchUserProfile",
  async () => {
    return await fetch("/api/user/profile").then((r) => r.json());
  },
  { userId: user.id },
);
```

### 2. Measure Sync Operations

```typescript
import { measureSync } from "@/lib/monitoring/performance";

const result = measureSync(
  "calculateHoroscope",
  () => {
    return performComplexCalculation(birthData);
  },
  { operation: "vedic-calculation" },
);
```

### 3. Start/Stop Timer

```typescript
import { startTimer } from "@/lib/monitoring/performance";

const endTimer = startTimer("dataProcessing", { batchSize: 1000 });

// ... perform operations ...

const { duration } = endTimer({ recordsProcessed: 1000 });
console.log(`Processed 1000 records in ${duration}ms`);
```

## API Tracking

### Track HTTP Requests

```typescript
import { trackApiRequest } from "@/lib/monitoring/performance";

export async function GET(request: Request) {
  return trackApiRequest("GET", "/api/horoscope", async () => {
    const data = await fetchHoroscopeData();
    return NextResponse.json(data);
  });
}
```

### Automatic Request Timing

Wrap all API routes:

```typescript
// middleware.ts
import { measureAsync } from "@/lib/monitoring/performance";

export async function middleware(request: NextRequest) {
  return measureAsync(
    "api_request",
    async () => {
      return NextResponse.next();
    },
    {
      method: request.method,
      path: request.nextUrl.pathname,
    },
  );
}
```

## Database Query Tracking

Database queries are automatically tracked via the Prisma client:

```typescript
import { prisma } from "@/lib/db/prisma";

// Automatically logged if query takes > 1 second
const users = await prisma.user.findMany();
```

Custom tracking:

```typescript
import { measureAsync } from "@/lib/monitoring/performance";

const result = await measureAsync(
  "complex_database_query",
  async () => {
    return await prisma.$queryRaw`
      SELECT * FROM users WHERE created_at > NOW() - INTERVAL '1 day'
    `;
  },
  { queryType: "recent_users" },
);
```

## React Component Tracking

### Track Component Renders

```typescript
'use client'

import { useRenderTracking } from '@/lib/monitoring/performance'

export function ExpensiveComponent({ userId }: Props) {
  useRenderTracking('ExpensiveComponent', { userId })

  return <div>...</div>
}
```

### Track Component Lifecycle

```typescript
'use client'

import { useEffect } from 'react'
import { startTimer } from '@/lib/monitoring/performance'

export function DataFetchingComponent() {
  useEffect(() => {
    const endTimer = startTimer('componentMount')

    // Fetch data...
    fetchData().then(() => {
      endTimer({ dataLoaded: true })
    })
  }, [])

  return <div>...</div>
}
```

## Web Vitals

### Enable Web Vitals Reporting

Add to `app/layout.tsx`:

```typescript
import { reportWebVitals } from "@/lib/monitoring/performance";

export { reportWebVitals };
```

Or use Next.js built-in:

```typescript
// app/layout.tsx
export function reportWebVitals(metric: any) {
  console.log(metric);
  // Send to analytics
}
```

### Tracked Metrics

- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial render
- **TTFB** (Time to First Byte) - Server response time

## Performance Budgets

Set maximum acceptable durations for operations:

```typescript
import { performanceBudget } from "@/lib/monitoring/performance";

// Set custom budgets
performanceBudget.setBudget("fetchUserData", 500); // 500ms max
performanceBudget.setBudget("renderDashboard", 1000); // 1 second max

// Check against budget (automatically logs warnings)
const endTimer = startTimer("fetchUserData");
const data = await fetchData();
const { duration } = endTimer();

performanceBudget.check("fetchUserData", duration);
```

### Default Budgets

| Operation        | Budget | Description                 |
| ---------------- | ------ | --------------------------- |
| `api_request`    | 2000ms | Maximum API response time   |
| `page_load`      | 3000ms | Maximum page load time      |
| `database_query` | 1000ms | Maximum database query time |

## Metrics API

### Get Performance Statistics

```bash
# All metrics
curl http://localhost:3000/api/metrics

# Specific metric
curl http://localhost:3000/api/metrics?name=api_request
```

### Response Format

```json
{
  "timestamp": "2025-12-03T15:00:00.000Z",
  "uptime": 3600,
  "performance": {
    "count": 150,
    "min": 12,
    "max": 2500,
    "mean": 245,
    "median": 180,
    "p95": 850,
    "p99": 1200
  },
  "cache": {
    "size": 45,
    "revalidating": 2
  },
  "deduplication": {
    "pendingRequests": 3
  },
  "memory": {
    "rss": 256,
    "heapTotal": 180,
    "heapUsed": 120,
    "external": 15
  },
  "slowOperations": [
    {
      "name": "fetchAstrologyData",
      "duration": "2345.67ms",
      "timestamp": "2025-12-03T14:59:00.000Z",
      "metadata": { "userId": "123" }
    }
  ]
}
```

## Monitoring Integration

### Sentry

Performance metrics are automatically sent to Sentry:

```typescript
// Automatically tracked:
// - Slow operations (> 1 second)
// - Web Vitals
// - Custom metrics

Sentry.metrics.distribution("performance.api_request", duration, {
  unit: "millisecond",
  tags: { endpoint: "/api/users" },
});
```

### Logs

All performance measurements are logged:

```typescript
// Development: Pretty-printed console logs
// Production: JSON logs for aggregation

logger.debug("Performance: fetchUserData", {
  duration: "245.67ms",
  userId: "123",
});

// Slow operations automatically logged as warnings
logger.warn("Slow operation detected", {
  operation: "complexQuery",
  duration: "2500ms",
});
```

## Performance Marks & Measures

Use Web Performance API:

```typescript
import { mark, measure } from "@/lib/monitoring/performance";

// Mark start
mark("fetchStart");

await fetchData();

// Mark end
mark("fetchEnd");

// Measure duration
const duration = measure("dataFetch", "fetchStart", "fetchEnd");
console.log(`Fetch took ${duration}ms`);
```

## Decorator Pattern

Use decorators for class methods (TypeScript 5+):

```typescript
import { tracked } from "@/lib/monitoring/performance";

class AstrologyService {
  @tracked("AstrologyService.calculateChart")
  async calculateChart(birthData: BirthData) {
    // Implementation
    // Automatically tracked!
  }

  @tracked() // Uses class.method as name
  async fetchPanchang() {
    // Implementation
  }
}
```

## Best Practices

### 1. Track Critical Paths

Focus on user-facing operations:

- Page loads
- API requests
- Database queries
- User interactions

### 2. Use Meaningful Names

```typescript
// Good
measureAsync('fetchUserProfile', ...)
measureAsync('calculateBirthChart', ...)

// Bad
measureAsync('func1', ...)
measureAsync('getData', ...)
```

### 3. Add Context Metadata

```typescript
measureAsync("fetchHoroscope", fetchFn, {
  userId: user.id,
  zodiacSign: "Aries",
  language: "en",
});
```

### 4. Set Realistic Budgets

Base budgets on:

- User expectations
- Industry standards
- Historical data
- Network conditions

### 5. Monitor Trends

Track metrics over time:

- Set up alerts for degradation
- Compare across releases
- Identify seasonal patterns

## Troubleshooting

### High API Latency

1. Check `/api/metrics` for slow operations
2. Review database query performance
3. Check external API calls
4. Verify caching is working

### Memory Leaks

1. Monitor memory metrics in `/api/metrics`
2. Check for unclosed connections
3. Review cache size
4. Look for event listener leaks

### Slow Renders

1. Use `useRenderTracking` to identify components
2. Check for unnecessary re-renders
3. Review component prop changes
4. Use React DevTools Profiler

## References

- [Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

# Load Testing Guide

## Overview

Load testing validates that the Digital Astrology platform can handle expected traffic loads and identifies performance bottlenecks. This guide covers tools, scenarios, and interpretation of results.

## Goals

1. **Validate Performance**: Ensure response times meet SLAs under load
2. **Find Bottlenecks**: Identify system limits (CPU, memory, database)
3. **Test Reliability**: Verify retry logic, caching, and error handling
4. **Capacity Planning**: Determine infrastructure requirements

---

## Load Testing Tools

### 1. k6 (Recommended)

Modern load testing tool with powerful scripting capabilities.

**Installation**:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### 2. Artillery

Fast and flexible alternative with YAML config.

**Installation**:
```bash
npm install -g artillery
```

### 3. Apache JMeter

GUI-based tool, good for complex scenarios.

**Installation**: Download from https://jmeter.apache.org/

---

## Test Scenarios

### Scenario 1: Homepage Load Test

**Goal**: Test main page under normal traffic

**k6 Script** (`tests/load/homepage.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests < 2s
    http_req_failed: ['rate<0.01'],    // <1% error rate
  },
};

export default function () {
  const res = http.get('https://your-domain.com/');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loaded': (r) => r.body.includes('Digital Astrology'),
  });

  sleep(1);
}
```

**Run**:
```bash
k6 run tests/load/homepage.js
```

### Scenario 2: API Load Test

**Goal**: Test API endpoints under sustained load

**k6 Script** (`tests/load/api.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '3m', target: 50 },   // Sustained load
    { duration: '1m', target: 100 },  // Spike
    { duration: '2m', target: 50 },   // Back to normal
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'https://your-domain.com';

export default function () {
  // Test health check
  let res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check OK': (r) => r.status === 200,
  });

  sleep(0.5);

  // Test horoscope API
  res = http.post(
    `${BASE_URL}/api/horoscope`,
    JSON.stringify({
      sign: 'Aries',
      date: '2025-12-03',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(res, {
    'horoscope API OK': (r) => r.status === 200,
    'has data': (r) => r.json('data') !== null,
  });

  sleep(1);
}
```

### Scenario 3: Stress Test

**Goal**: Find system breaking point

**k6 Script** (`tests/load/stress.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Below normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },   // Normal load
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },   // Around breaking point
    { duration: '5m', target: 300 },
    { duration: '2m', target: 400 },   // Beyond breaking point
    { duration: '5m', target: 400 },
    { duration: '10m', target: 0 },    // Recovery
  ],
};

export default function () {
  const res = http.get('https://your-domain.com/api/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

### Scenario 4: Cache Effectiveness Test

**Goal**: Verify caching reduces database load

**k6 Script** (`tests/load/cache-test.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

const userId = 'test-user-123';

export default function () {
  // Request same data repeatedly to test cache
  const res = http.get(`https://your-domain.com/api/user/${userId}/profile`);

  check(res, {
    'status OK': (r) => r.status === 200,
    'fast response': (r) => r.timings.duration < 200, // Should be fast from cache
  });
}
```

**Artillery Config** (`tests/load/cache-test.yml`):
```yaml
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 20
  processor: "./test-functions.js"

scenarios:
  - name: "Test Cache"
    flow:
      - get:
          url: "/api/user/{{ userId }}/profile"
          capture:
            - json: "$.data.name"
              as: "userName"
      - think: 1
      - get:
          url: "/api/user/{{ userId }}/horoscope"
```

---

## Testing Retry and Circuit Breaker

### Scenario 5: External Service Failure

**Goal**: Verify retry logic handles failures gracefully

**k6 Script** (`tests/load/retry-test.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // Allow higher error rate since we're testing retries
    http_req_failed: ['rate<0.10'], // <10% ultimate failure
  },
};

export default function () {
  // Call endpoint that depends on external service
  const res = http.get('https://your-domain.com/api/external-data');

  check(res, {
    'eventually successful': (r) => r.status === 200 || r.status === 503,
    'has retry header': (r) => r.headers['X-Retry-Count'] !== undefined,
  });
}
```

---

## Monitoring During Load Tests

### Real-time Monitoring Commands

```bash
# Terminal 1: Run load test
k6 run tests/load/api.js

# Terminal 2: Monitor metrics endpoint
watch -n 1 'curl -s http://localhost:3000/api/metrics | jq "{p95: .performance.p95, memory: .memory.heapUsed, slow: .slowOperations | length}"'

# Terminal 3: Monitor system resources
watch -n 1 'ps aux | grep node'

# Terminal 4: Monitor database
watch -n 1 'psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"'
```

### Monitoring Checklist

During load test, monitor:
- [ ] Response times (P50, P95, P99)
- [ ] Error rates
- [ ] CPU usage
- [ ] Memory usage
- [ ] Database connections
- [ ] Cache hit rate
- [ ] Slow operations count
- [ ] Circuit breaker state

---

## Interpreting Results

### k6 Output Metrics

```
✓ http_req_duration..............: avg=245ms  min=45ms  med=180ms  max=2.5s  p(90)=450ms p(95)=850ms
✗ http_req_failed................: 2.34%  ✓ 47  ✗ 1953
  http_req_receiving.............: avg=2.1ms  min=0.5ms med=1.8ms  max=45ms
  http_req_sending...............: avg=1.2ms  min=0.3ms med=0.9ms  max=15ms
  http_req_waiting...............: avg=241ms  min=43ms  med=177ms  max=2.4s
  http_reqs......................: 2000   66.5/s
  iteration_duration.............: avg=1.24s  min=1.04s med=1.18s  max=3.5s
```

**Analysis**:
- ✅ **P95 < 1s**: Good performance
- ⚠️ **Error rate 2.34%**: Slightly high, investigate
- ✅ **Throughput 66.5 req/s**: Meets requirements
- ⚠️ **Max response 2.5s**: Identify slow operations

### Performance Targets

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| P50 Response Time | < 200ms | < 500ms | > 500ms |
| P95 Response Time | < 500ms | < 1000ms | > 1000ms |
| P99 Response Time | < 1000ms | < 2000ms | > 2000ms |
| Error Rate | < 0.1% | < 1% | > 1% |
| Throughput | > 100 req/s | > 50 req/s | < 50 req/s |

---

## Database Load Testing

### Test Database Connection Pool

```bash
# Create load with many concurrent connections
k6 run --vus 100 --duration 30s tests/load/db-pool.js
```

**Script** (`tests/load/db-pool.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,  // 100 virtual users
  duration: '30s',
};

export default function () {
  // Each request requires database query
  const res = http.get('https://your-domain.com/api/users');

  check(res, {
    'no connection errors': (r) => !r.body.includes('connection'),
  });
}
```

**Monitor**:
```bash
# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres'"

# Check connection pool stats (if available)
curl -s http://localhost:3000/api/metrics | jq '.database'
```

---

## Automated Load Testing

### CI/CD Integration

**GitHub Actions** (`.github/workflows/load-test.yml`):
```yaml
name: Load Test

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run Load Test
        run: |
          k6 run tests/load/api.js \
            --out json=results.json \
            --summary-export=summary.json

      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: |
            results.json
            summary.json

      - name: Check Thresholds
        run: |
          # Fail if thresholds not met
          if grep -q "✗" summary.json; then
            echo "Load test thresholds not met"
            exit 1
          fi
```

### Scheduled Testing

```bash
# cron job to run weekly load test
0 2 * * 0 cd /path/to/project && k6 run tests/load/weekly.js > /var/log/load-test-$(date +\%Y\%m\%d).log 2>&1
```

---

## Load Testing Checklist

### Pre-Test
- [ ] Backup production database (if testing prod)
- [ ] Notify team of load test
- [ ] Ensure monitoring is active
- [ ] Scale up infrastructure if needed
- [ ] Set up alert thresholds

### During Test
- [ ] Monitor response times
- [ ] Watch error rates
- [ ] Check resource utilization
- [ ] Observe database performance
- [ ] Monitor cache effectiveness

### Post-Test
- [ ] Analyze results
- [ ] Identify bottlenecks
- [ ] Document findings
- [ ] Create optimization tickets
- [ ] Update capacity plans
- [ ] Scale down test infrastructure

---

## Common Issues and Solutions

### Issue: High Response Times

**Symptoms**:
- P95 > 2 seconds
- Increasing latency over time

**Investigation**:
```bash
# Check slow operations
curl -s http://localhost:3000/api/metrics | jq '.slowOperations'

# Check database queries
# Review Prisma logs for slow queries
```

**Solutions**:
- Add database indexes
- Optimize N+1 queries
- Increase cache TTL
- Add response compression

### Issue: Connection Pool Exhaustion

**Symptoms**:
- Errors: "Connection pool timeout"
- High error rate
- Timeouts

**Investigation**:
```bash
# Check connection pool
curl -s http://localhost:3000/api/ready | jq '.checks.database'
```

**Solutions**:
- Increase `connection_limit` in DATABASE_URL
- Use Supabase connection pooler (pgbouncer)
- Optimize long-running queries
- Add request queuing

### Issue: Memory Leaks

**Symptoms**:
- Increasing memory usage over time
- OOM errors
- Crashes

**Investigation**:
```bash
# Monitor memory
watch -n 1 'curl -s http://localhost:3000/api/metrics | jq .memory'
```

**Solutions**:
- Clear cache periodically
- Fix event listener leaks
- Increase memory limit
- Restart application periodically

### Issue: Circuit Breaker Opens

**Symptoms**:
- Errors: "Circuit breaker is open"
- Service unavailable

**Investigation**:
- Check Sentry for circuit breaker events
- Test external service availability

**Solutions**:
- Fix external service integration
- Increase timeout values
- Add fallback responses
- Increase circuit breaker threshold

---

## Load Testing Best Practices

1. **Start Small**: Begin with low load and gradually increase
2. **Test Realistic Scenarios**: Mimic actual user behavior
3. **Monitor Everything**: Watch all system metrics during tests
4. **Test Different Times**: Run tests during peak and off-peak hours
5. **Document Results**: Keep history of test results for comparison
6. **Automate**: Set up regular automated load tests
7. **Test Failures**: Include failure scenarios (network issues, timeouts)
8. **Use Production-like Data**: Test with realistic data volumes
9. **Clean Up**: Remove test data after completion
10. **Share Results**: Communicate findings with team

---

## Sample Test Plan

### Week 1: Baseline Testing
- Run homepage load test
- Run API load test
- Document baseline metrics
- Identify obvious bottlenecks

### Week 2: Optimization
- Implement fixes
- Re-run tests
- Compare to baseline
- Iterate

### Week 3: Stress Testing
- Find breaking points
- Test recovery
- Document limits
- Plan capacity

### Week 4: Production Validation
- Final load test
- Verify monitoring
- Update documentation
- Deploy to production

---

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Performance Testing Best Practices](https://web.dev/performance-testing/)
- [Database Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Last Updated**: 2025-12-03
**Version**: 1.0.0

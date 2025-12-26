# Monitoring Alerts Configuration Guide

## Overview

This guide covers setting up monitoring alerts for the Digital Astrology platform to ensure reliability and performance. Alerts help detect issues before they impact users.

## Alert Categories

### 1. Application Health

### 2. Performance Degradation

### 3. Error Rates

### 4. Resource Utilization

### 5. Security Events

---

## 1. Sentry Alerts

Sentry provides error tracking and performance monitoring with built-in alerting.

### Setup Steps

1. **Access Alert Rules**
   - Go to https://sentry.io/organizations/[your-org]/alerts/
   - Click "Create Alert"

2. **Create Error Alert**

   ```
   Alert Name: High Error Rate
   Environment: production
   Condition:
     - When the issue is first seen
     - OR when error rate exceeds 5% over 1 minute
   Action:
     - Send notification via email
     - Send to Slack channel #alerts
   ```

3. **Create Performance Alert**
   ```
   Alert Name: Slow API Responses
   Environment: production
   Condition:
     - When average transaction duration > 2 seconds
     - For 5 minutes
   Action:
     - Send notification via email
     - Create PagerDuty incident
   ```

### Recommended Sentry Alerts

#### Critical Alerts (PagerDuty/On-call)

- **Circuit Breaker Opened**: Tag = `circuit_breaker:opened`
- **Database Connection Failures**: Error contains "database" or "prisma"
- **Authentication Failures**: Error rate > 10% in 5 minutes
- **Payment Processing Errors**: Error contains "payment" or "razorpay"

#### Warning Alerts (Slack/Email)

- **Slow Queries**: Query duration > 5 seconds
- **High Memory Usage**: Memory > 1GB for 5 minutes
- **Elevated Error Rate**: Error rate > 1% for 10 minutes
- **Failed Health Checks**: Health check errors > 3 in 5 minutes

#### Info Alerts (Email only)

- **New Error Types**: When new error is first seen
- **Performance Regression**: P95 latency increase > 50%
- **Deprecated API Usage**: Specific error patterns

### Sentry Alert Configuration

```javascript
// sentry.server.config.ts - Add custom tags for alerting
Sentry.init({
  beforeSend(event, hint) {
    // Tag circuit breaker events
    if (event.message?.includes("Circuit breaker opened")) {
      event.tags = {
        ...event.tags,
        alert_priority: "critical",
        circuit_breaker: "opened",
      };
    }

    // Tag database errors
    if (event.message?.includes("database") || event.message?.includes("prisma")) {
      event.tags = {
        ...event.tags,
        alert_priority: "critical",
        component: "database",
      };
    }

    return event;
  },
});
```

---

## 2. Uptime Monitoring Alerts

Use services like UptimeRobot, Pingdom, or StatusCake.

### Setup with UptimeRobot (Free)

1. **Create Account**: https://uptimerobot.com

2. **Add Health Check Monitor**

   ```
   Monitor Type: HTTP(s)
   Friendly Name: Production Health Check
   URL: https://your-domain.com/api/health
   Monitoring Interval: 5 minutes
   Alert Contacts:
     - Email
     - Slack
     - SMS (premium)
   ```

3. **Add Readiness Check Monitor**

   ```
   Monitor Type: HTTP(s) with Keyword
   Friendly Name: Production Readiness
   URL: https://your-domain.com/api/ready
   Keyword: "status":"ready"
   Alert When: Keyword not found OR status code not 200
   ```

4. **Alert Settings**
   - Alert when down for 2 minutes (2 failed checks)
   - Send recovery notification
   - Alert via Email and Slack

### Recommended Monitoring Endpoints

| Endpoint       | Check        | Frequency | Alert Threshold        |
| -------------- | ------------ | --------- | ---------------------- |
| `/api/health`  | Basic health | 5 min     | 2 consecutive failures |
| `/api/ready`   | Dependencies | 5 min     | 2 consecutive failures |
| `/api/metrics` | Performance  | 15 min    | Response time > 5s     |
| `/`            | Homepage     | 5 min     | Status code != 200     |
| `/auth/login`  | Auth flow    | 10 min    | Status code != 200     |

---

## 3. Performance Monitoring Alerts

Monitor performance degradation using custom metrics.

### Setup Performance Alerts

#### Via Metrics Endpoint

Create a cron job or monitoring script:

```bash
#!/bin/bash
# check-performance.sh

METRICS=$(curl -s https://your-domain.com/api/metrics)
P95=$(echo $METRICS | jq -r '.performance.p95')
SLOW_OPS=$(echo $METRICS | jq -r '.slowOperations | length')

# Alert if P95 latency > 3 seconds
if [ $(echo "$P95 > 3000" | bc) -eq 1 ]; then
  echo "ALERT: High P95 latency: ${P95}ms"
  # Send alert (email, Slack, PagerDuty)
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    -d "{\"text\":\"⚠️ Performance Alert: P95 latency ${P95}ms\"}"
fi

# Alert if > 5 slow operations
if [ $SLOW_OPS -gt 5 ]; then
  echo "ALERT: ${SLOW_OPS} slow operations detected"
fi
```

Run via cron:

```cron
*/15 * * * * /path/to/check-performance.sh
```

#### Via Application Logs

Use log aggregation services (CloudWatch, Datadog, ELK):

**CloudWatch Alarms** (if on AWS):

```
Metric: Custom Metric "SlowOperations"
Condition: > 5 occurrences in 5 minutes
Action: Send SNS notification
```

**Datadog Monitors** (if using Datadog):

```
Monitor Type: Metric
Metric: performance.p95
Condition: > 2000ms for 10 minutes
Alert: #alerts channel
```

---

## 4. Database Monitoring Alerts

### Database Connection Pool

Monitor connection pool usage:

```bash
#!/bin/bash
# check-db-pool.sh

METRICS=$(curl -s https://your-domain.com/api/ready)
DB_STATUS=$(echo $METRICS | jq -r '.checks.database.status')
DB_LATENCY=$(echo $METRICS | jq -r '.checks.database.latency')

# Alert if database unhealthy
if [ "$DB_STATUS" != "ok" ]; then
  echo "CRITICAL: Database connection failed"
  # Send critical alert
fi

# Alert if latency > 1 second
if [ $(echo "$DB_LATENCY > 1000" | bc) -eq 1 ]; then
  echo "WARNING: High database latency: ${DB_LATENCY}ms"
  # Send warning
fi
```

### Supabase Dashboard Alerts

Configure in Supabase Dashboard:

1. Go to **Database** > **Extensions** > Enable **pg_stat_statements**
2. Set up alerts for:
   - **Connection limit**: > 80% of max connections
   - **Disk usage**: > 80% capacity
   - **CPU usage**: > 80% for 5 minutes
   - **Long-running queries**: Query duration > 30 seconds

---

## 5. Resource Utilization Alerts

### Memory Monitoring

```bash
#!/bin/bash
# check-memory.sh

METRICS=$(curl -s https://your-domain.com/api/metrics)
HEAP_USED=$(echo $METRICS | jq -r '.memory.heapUsed')
HEAP_TOTAL=$(echo $METRICS | jq -r '.memory.heapTotal')
USAGE_PCT=$(echo "scale=2; $HEAP_USED / $HEAP_TOTAL * 100" | bc)

# Alert if memory usage > 85%
if [ $(echo "$USAGE_PCT > 85" | bc) -eq 1 ]; then
  echo "WARNING: High memory usage: ${USAGE_PCT}%"
  # Send alert
fi
```

### Cache Performance

```bash
#!/bin/bash
# check-cache.sh

METRICS=$(curl -s https://your-domain.com/api/metrics)
CACHE_SIZE=$(echo $METRICS | jq -r '.cache.size')

# Alert if cache is full (> 900 entries, max is 1000)
if [ $CACHE_SIZE -gt 900 ]; then
  echo "WARNING: Cache near capacity: ${CACHE_SIZE}/1000"
  # Send alert
fi
```

---

## 6. Alert Channels

### Slack Integration

**Setup Incoming Webhook**:

1. Go to https://api.slack.com/apps
2. Create New App > From scratch
3. Add "Incoming Webhooks" feature
4. Create webhook for #alerts channel
5. Copy webhook URL

**Send Alert**:

```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🚨 Alert: High error rate detected",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Error Rate Alert*\n\nError rate: 10%\nEnvironment: production\nTime: 2025-12-03 15:00:00"
        }
      }
    ]
  }'
```

### Email Alerts

Use services like SendGrid or AWS SES:

```typescript
// lib/alerts/email.ts
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendAlert(
  subject: string,
  message: string,
  priority: "critical" | "warning" | "info",
) {
  const msg = {
    to: "alerts@yourcompany.com",
    from: "noreply@yourcompany.com",
    subject: `[${priority.toUpperCase()}] ${subject}`,
    text: message,
    html: `
      <div style="padding: 20px; background-color: ${
        priority === "critical" ? "#ff0000" : priority === "warning" ? "#ff9900" : "#0099ff"
      }; color: white;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <p><small>Time: ${new Date().toISOString()}</small></p>
      </div>
    `,
  };

  await sgMail.send(msg);
}
```

### PagerDuty Integration (On-call)

For critical alerts requiring immediate response:

1. Create PagerDuty account
2. Set up integration with Sentry
3. Configure escalation policies
4. Define on-call schedules

---

## 7. Alert Priority Levels

### Critical (Immediate Response Required)

- Production down (health check failing)
- Database connection failure
- Payment processing errors
- Authentication system down
- Circuit breaker opened
- Security breach detected

**Response Time**: < 5 minutes
**Channels**: PagerDuty, SMS, Phone, Slack

### Warning (Response Within 1 Hour)

- High error rate (> 5%)
- Slow API responses (> 3s)
- High memory usage (> 85%)
- Database connection pool > 80%
- Elevated 4xx errors (> 10%)

**Response Time**: < 1 hour
**Channels**: Slack, Email

### Info (Review Daily)

- New error types
- Performance degradation (> 20%)
- Cache hit rate changes
- Dependency updates available

**Response Time**: < 24 hours
**Channels**: Email, Dashboard

---

## 8. Alert Runbooks

### Health Check Failure

**Alert**: Health check endpoint returning 503

**Investigation Steps**:

1. Check application logs: `kubectl logs -l app=web --tail=100`
2. Check `/api/ready` for dependency status
3. Check database connectivity: `psql $DATABASE_URL -c "SELECT 1"`
4. Check memory usage: `/api/metrics`
5. Review recent deployments

**Remediation**:

- Restart application if memory leak
- Scale up if resource constrained
- Fix database connection if needed
- Rollback deployment if recent change

### Circuit Breaker Opened

**Alert**: Circuit breaker opened for external service

**Investigation Steps**:

1. Check Sentry for error context
2. Test external service manually
3. Check service status page
4. Review rate limits

**Remediation**:

- Wait for circuit breaker auto-reset (30s)
- Contact external service if ongoing issue
- Enable fallback/cache if available
- Consider alternative service

### High Database Latency

**Alert**: Database queries > 1 second

**Investigation Steps**:

1. Check `/api/metrics` for slow operations
2. Review Prisma query logs
3. Check database CPU/memory in Supabase dashboard
4. Review connection pool stats

**Remediation**:

- Add database indexes
- Optimize slow queries
- Increase connection pool size
- Scale up database plan

---

## 9. Testing Alerts

### Test Health Check Alert

```bash
# Simulate downtime
docker stop web-container
# Wait for alert (should arrive in 2-5 minutes)
# Verify alert received
docker start web-container
# Verify recovery notification
```

### Test Performance Alert

```bash
# Trigger slow operation
curl http://localhost:3000/api/test-slow?duration=5000
# Check metrics
curl http://localhost:3000/api/metrics | jq '.slowOperations'
```

### Test Error Alert

```bash
# Trigger test error via Sentry test page
curl http://localhost:3000/sentry-test
# Check Sentry dashboard for alert
```

---

## 10. Alert Maintenance

### Weekly

- Review alert thresholds
- Check for false positives
- Update contact information
- Test escalation paths

### Monthly

- Review alert response times
- Analyze alert trends
- Update runbooks
- Review and adjust thresholds

### Quarterly

- Audit all alert rules
- Update on-call schedules
- Review incident retrospectives
- Optimize alert routing

---

## Quick Setup Checklist

- [ ] Set up Sentry error alerts
- [ ] Configure Sentry performance alerts
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure Slack webhook
- [ ] Set up email alerts
- [ ] Create monitoring scripts
- [ ] Schedule cron jobs for checks
- [ ] Configure Supabase dashboard alerts
- [ ] Set up PagerDuty (for production)
- [ ] Document alert runbooks
- [ ] Test all alert channels
- [ ] Train team on alert response

---

## Integration Examples

### Complete Alert Script

```bash
#!/bin/bash
# comprehensive-monitoring.sh

DOMAIN="https://your-domain.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK"

# Function to send Slack alert
send_alert() {
  local message=$1
  local priority=$2
  local emoji="${3:-🚨}"

  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"${emoji} [${priority}] ${message}\"}"
}

# Check health
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/health)
if [ $HEALTH -ne 200 ]; then
  send_alert "Health check failed (HTTP $HEALTH)" "CRITICAL" "🔴"
fi

# Check readiness
READY=$(curl -s $DOMAIN/api/ready)
READY_STATUS=$(echo $READY | jq -r '.status')
if [ "$READY_STATUS" != "ready" ]; then
  send_alert "Readiness check failed" "CRITICAL" "🔴"
fi

# Check performance
METRICS=$(curl -s $DOMAIN/api/metrics)
P95=$(echo $METRICS | jq -r '.performance.p95 // 0')
if [ $(echo "$P95 > 2000" | bc) -eq 1 ]; then
  send_alert "High P95 latency: ${P95}ms" "WARNING" "⚠️"
fi

# Check memory
MEM_USED=$(echo $METRICS | jq -r '.memory.heapUsed')
MEM_TOTAL=$(echo $METRICS | jq -r '.memory.heapTotal')
MEM_PCT=$(echo "scale=2; $MEM_USED / $MEM_TOTAL * 100" | bc)
if [ $(echo "$MEM_PCT > 85" | bc) -eq 1 ]; then
  send_alert "High memory usage: ${MEM_PCT}%" "WARNING" "⚠️"
fi

echo "Monitoring check completed at $(date)"
```

**Cron Schedule**:

```cron
# Run every 5 minutes
*/5 * * * * /path/to/comprehensive-monitoring.sh >> /var/log/monitoring.log 2>&1
```

---

## Resources

- [Sentry Alert Documentation](https://docs.sentry.io/product/alerts/)
- [UptimeRobot Documentation](https://uptimerobot.com/api/)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [PagerDuty Integration](https://www.pagerduty.com/docs/)
- [AWS CloudWatch Alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

---

**Last Updated**: 2025-12-03
**Version**: 1.0.0

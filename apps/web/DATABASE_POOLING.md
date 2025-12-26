# Database Connection Pooling Configuration

## Overview

Database connection pooling is configured via the `DATABASE_URL` environment variable using query parameters. This provides better control over connection management and prevents connection exhaustion.

## Configuration

### Development Settings

For local development with moderate traffic:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?connection_limit=5&pool_timeout=20"
```

### Production Settings

For production with high traffic:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### Supabase Settings

For Supabase with connection pooler:

```bash
# Transaction mode (recommended for most use cases)
DATABASE_URL="postgresql://user:password@db.project.supabase.co:6543/postgres?pgbouncer=true&connection_limit=10"

# Session mode (for advanced features like prepared statements)
DATABASE_URL="postgresql://user:password@db.project.supabase.co:5432/postgres?connection_limit=5"
```

## Query Parameters

| Parameter          | Description                               | Default | Recommended               |
| ------------------ | ----------------------------------------- | ------- | ------------------------- |
| `connection_limit` | Maximum number of connections in the pool | 10      | 5-20 depending on traffic |
| `pool_timeout`     | Seconds to wait for connection from pool  | 10      | 20                        |
| `connect_timeout`  | Seconds to wait for new connection        | 5       | 10                        |
| `pgbouncer`        | Use Supabase connection pooler            | false   | true for Supabase         |

## Calculating Connection Limits

### Formula

```
Total Connections = (Number of Instances) × (connection_limit per instance)
```

### Recommendations

- **Serverless (Vercel/Netlify)**: 5-10 connections per function
- **Single Server**: 10-20 connections
- **Multiple Servers**: Divide max DB connections by number of servers

### PostgreSQL Max Connections

Check your database's max connections:

```sql
SHOW max_connections;
```

Most PostgreSQL databases allow 100-200 connections. Leave headroom for:

- Other applications
- Maintenance tools
- Connection overhead

## Monitoring

### Check Active Connections

```typescript
import { getDatabaseStats } from "@/lib/db/prisma";

const stats = await getDatabaseStats();
console.log("Active connections:", stats.activeConnections);
```

### Health Check

```bash
curl http://localhost:3000/api/ready
```

Response includes database latency and connection status.

## Troubleshooting

### Error: "Too many connections"

**Cause**: Connection limit reached

**Solutions**:

1. Increase `connection_limit` (if database allows)
2. Reduce number of concurrent requests
3. Use Supabase connection pooler (`pgbouncer=true`)
4. Upgrade database plan

### Error: "Connection timeout"

**Cause**: No connections available in pool

**Solutions**:

1. Increase `pool_timeout`
2. Increase `connection_limit`
3. Check for connection leaks (unclosed connections)
4. Review slow queries

### Slow Queries

The Prisma client automatically logs queries slower than 1 second. Check logs for:

```
"Slow database query detected"
```

Optimize slow queries with:

- Indexes
- Query optimization
- Caching
- Database query analysis

## Best Practices

1. **Use Connection Pooling**: Always enable pooling in production
2. **Monitor Connections**: Set up alerts for connection usage > 80%
3. **Graceful Shutdown**: Application handles SIGTERM/SIGINT to close connections
4. **Singleton Pattern**: Use single Prisma Client instance (already configured)
5. **Transaction Timeout**: Configure appropriate timeouts for long transactions
6. **Retry Logic**: Built-in retry for deadlocks and transient errors

## Integration with Monitoring

Connection metrics are automatically sent to:

- Application logs (Winston)
- Sentry (errors only)
- Health check endpoints (`/api/health`, `/api/ready`)

Set up alerts for:

- High connection usage (> 80%)
- Connection timeouts
- Slow queries (> 1s)
- Failed health checks

## References

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

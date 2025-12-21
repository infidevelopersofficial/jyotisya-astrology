# Railway Deployment Guide

## Quick Deployment

### 1. Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway

### 2. Deploy to Railway

1. **Create New Project**
   ```
   Visit: https://railway.app/new
   Select: "Deploy from GitHub repo"
   ```

2. **Configure Root Directory**
   ```
   Settings → General → Root Directory
   Set to: digital-astrology/services/astro-core-python
   ```

3. **Environment Variables**
   ```
   ASTROLOGY_BACKEND=internal
   FREE_API_KEY=<optional-for-fallback>
   ```

4. **Deploy**
   - Railway auto-detects Python and installs dependencies
   - Uses `railway.toml` for configuration
   - Falls back to `Procfile` if needed

### 3. Get Service URL

After deployment:
```
Settings → Domains → Generate Domain
Example: https://astro-core-python-production.up.railway.app
```

### 4. Update Vercel Environment Variables

Add to Vercel project settings:
```
ASTRO_PYTHON_SERVICE_URL=https://your-railway-domain.railway.app
ASTRO_PYTHON_SERVICE_TIMEOUT_MS=10000
```

## Health Check

Test the deployed service:
```bash
curl https://your-railway-domain.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "source": "internal_astrology_engine",
  "version": "1.0.0"
}
```

## Monitoring

Railway provides:
- CPU/Memory usage graphs
- Request logs
- Error tracking
- Build logs

## Cost Estimate

**Free Tier**: $5 credit/month
**Hobby Plan**: $5/month (500 hours)

This service typically uses ~$5-10/month depending on traffic.

## Troubleshooting

### Build Fails
- Check `requirements.txt` is present
- Verify Python version compatibility (3.9+)
- Check build logs in Railway dashboard

### Service Not Starting
- Verify `router.py` exists (not `main.py`)
- Check logs for import errors
- Ensure ephemeris data downloads correctly

### 504 Gateway Timeout
- Check service is running: `/health` endpoint
- Verify `APP_PORT=$PORT` is set correctly
- Check for long-running calculations

## Local Testing

Test Railway configuration locally:
```bash
cd services/astro-core-python
export PORT=4001
export ASTROLOGY_BACKEND=internal
uvicorn router:app --host 0.0.0.0 --port $PORT
```

## Rollback

Railway keeps deployment history:
```
Deployments → Select previous version → Redeploy
```

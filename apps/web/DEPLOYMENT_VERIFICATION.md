# Quick Deployment Verification Checklist

**Production Domain**: https://www.jyotirvidya.app
**Migration Date**: January 2025

---

## ⚡ Pre-Deployment (Complete BEFORE running deploy script)

### 1. Vercel Domain Setup (15 minutes)

- [ ] Log in to https://vercel.com/dashboard
- [ ] Go to your project → Settings → Domains
- [ ] Click **Add Domain** → Enter `www.jyotirvidya.app`
- [ ] Configure DNS at your registrar:
  ```
  CNAME   www    cname.vercel-dns.com.
  A       @      76.76.21.21
  ```
- [ ] Wait for SSL certificate (shows "SSL: Active")
- [ ] Set `www.jyotirvidya.app` as **Production Domain**

### 2. Razorpay Webhook (5 minutes)

- [ ] Log in to https://dashboard.razorpay.com/ (**Live Mode**)
- [ ] Go to Settings → Webhooks
- [ ] Update URL to: `https://www.jyotirvidya.app/api/webhooks/razorpay`
- [ ] Ensure events enabled: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`
- [ ] Copy **Webhook Secret**
- [ ] Click **Save**

### 3. Vercel Environment Variables (5 minutes)

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Update/Add these for **Production** only:
  ```
  NEXT_PUBLIC_APP_URL=https://www.jyotirvidya.app
  RAZORPAY_WEBHOOK_SECRET=[paste secret from Razorpay]
  ```
- [ ] Click **Save**
- [ ] **Important**: Redeploy required for env changes to take effect

### 4. Code Changes (Already Done ✅)

- [x] `deploy-to-production.sh` → `PRODUCTION_URL` updated
- [x] `app/layout.tsx` → canonical URL updated
- [x] Legal pages → email addresses updated to `@jyotirvidya.app`
- [x] `.env.example` → `NEXT_PUBLIC_APP_URL` updated

---

## 🚀 During Deployment (Follow Script Prompts)

The `deploy-to-production.sh` script will automatically:

1. Stage and commit all changes
2. Push to staging and wait for deployment
3. Run smoke tests
4. **Pause for your confirmation** ✋
5. Merge to main and push
6. Create version tag `v0.1.0`
7. **Pause for Razorpay webhook confirmation** ✋
8. Run production smoke tests
9. Display success summary

**Your Actions Required**:

- Step 7: Type `yes` after verifying staging works
- Step 12: Type `yes` after confirming Razorpay webhook updated

---

## ✅ Post-Deployment (5-10 minutes)

### Critical Tests (Do These Immediately)

#### 1. Domain Accessibility

```bash
curl -I https://www.jyotirvidya.app
# Expected: HTTP/2 200
```

- [ ] Production URL loads in browser
- [ ] SSL certificate is valid (🔒 icon in browser)

#### 2. Legal Pages

Visit and verify all load correctly:

- [ ] https://www.jyotirvidya.app/privacy (email shows `@jyotirvidya.app`)
- [ ] https://www.jyotirvidya.app/terms (email shows `@jyotirvidya.app`)
- [ ] https://www.jyotirvidya.app/refund-policy (email shows `@jyotirvidya.app`)

#### 3. API Endpoints

```bash
curl https://www.jyotirvidya.app/api/health
# Expected: {"status":"ok"}

curl https://www.jyotirvidya.app/api/ready
# Expected: {"status":"ok","timestamp":"..."}
```

- [ ] Health check responds
- [ ] Ready check responds

#### 4. Razorpay Webhook Test

- [ ] Go to Razorpay Dashboard → Webhooks
- [ ] Click **Send Test Webhook** → `payment.authorized`
- [ ] Check Sentry for webhook breadcrumb
- [ ] **Critical**: Webhook must work or payments will fail!

#### 5. Cookie Banner

- [ ] Open https://www.jyotirvidya.app in incognito mode
- [ ] Cookie banner appears
- [ ] Click "Accept All" → banner disappears
- [ ] Refresh page → banner stays hidden

#### 6. Sentry Monitoring

- [ ] Visit https://sentry.io/ → your project
- [ ] Check **Issues** (last 1 hour)
- [ ] Verify error rate < 0.1%
- [ ] No critical errors

---

## 📊 Success Indicators

You'll know deployment succeeded when:

✅ **Terminal Output**:

```
╔════════════════════════════════════════════════════════════════════╗
║              ✅ DEPLOYMENT COMPLETED SUCCESSFULLY ✅               ║
╚════════════════════════════════════════════════════════════════════╝

Production URL:        https://www.jyotirvidya.app
Version:               v0.1.0
Branch:                main
```

✅ **Browser Tests**:

- Homepage loads instantly
- No "Deployment Error" messages
- SSL certificate valid
- All legal pages render correctly

✅ **Dashboard Checks**:

- **Vercel**: Latest deployment shows "Ready" ✅
- **Razorpay**: Webhook status "Active" with production URL
- **Sentry**: No new critical errors, webhook logs visible

✅ **Git Checks**:

```bash
git tag -l | grep v0.1.0
# Output: v0.1.0

git log main --oneline -1
# Output: Shows "🚀 Week 1 MVP Complete..."
```

---

## 🚨 Troubleshooting

### Issue: "www.jyotirvidya.app not found" (404)

**Cause**: DNS not configured or not propagated yet
**Fix**:

1. Verify DNS records at your registrar
2. Wait 5-10 minutes for DNS propagation
3. Test with: `nslookup www.jyotirvidya.app`
4. If still not working, check Vercel domain settings

### Issue: SSL Certificate Error

**Cause**: Certificate not issued yet
**Fix**:

1. Go to Vercel → Domains
2. Click **Retry SSL** next to domain
3. Wait 2-3 minutes
4. Refresh page to verify "SSL: Active"

### Issue: Webhook Test Fails in Razorpay

**Cause**: Incorrect webhook URL or endpoint not responding
**Fix**:

1. Verify URL is exactly: `https://www.jyotirvidya.app/api/webhooks/razorpay`
2. Test endpoint manually: `curl -I https://www.jyotirvidya.app/api/webhooks/razorpay`
3. Expected: 405 Method Not Allowed (means endpoint exists)
4. Check Vercel deployment logs for errors

### Issue: Environment Variables Not Working

**Cause**: Forgot to redeploy after updating env vars
**Fix**:

1. Go to Vercel → Deployments
2. Click **...** on latest deployment → **Redeploy**
3. Wait 2-3 minutes for redeployment
4. Test again

---

## 🔄 Rollback Procedure (If Needed)

If deployment fails and you need to rollback:

```bash
# 1. Switch to main branch
git checkout main

# 2. Revert last commit
git revert HEAD --no-edit

# 3. Push revert
git push origin main

# 4. Vercel auto-redeploys to previous version (wait 2-3 min)

# 5. Verify rollback successful
curl -I https://www.jyotirvidya.app
```

Then:

- [ ] Investigate failure reason
- [ ] Fix issues
- [ ] Re-run deployment script

---

## 📝 Quick Command Reference

### Test Production URL

```bash
curl -I https://www.jyotirvidya.app
```

### Test API Endpoints

```bash
curl https://www.jyotirvidya.app/api/health
curl https://www.jyotirvidya.app/api/ready
```

### Verify Git Tag

```bash
git tag -l | grep v0.1.0
```

### Check DNS Propagation

```bash
nslookup www.jyotirvidya.app
dig www.jyotirvidya.app
```

### Verify SSL Certificate

```bash
openssl s_client -connect www.jyotirvidya.app:443 -servername www.jyotirvidya.app < /dev/null | grep "Verify return code"
```

---

## ⏱️ Estimated Timeline

| Task                         | Duration   | When                  |
| ---------------------------- | ---------- | --------------------- |
| Vercel domain setup          | 15 min     | **Before deployment** |
| Razorpay webhook update      | 5 min      | **Before deployment** |
| Vercel env vars update       | 5 min      | **Before deployment** |
| Run deployment script        | 25 min     | **Main deployment**   |
| Post-deployment verification | 10 min     | **After deployment**  |
| **Total**                    | **60 min** |                       |

---

## ✅ Final Checklist Before Running Script

- [ ] Vercel domain configured with SSL active
- [ ] Razorpay webhook URL updated to production
- [ ] Razorpay webhook secret added to Vercel env vars
- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel env vars
- [ ] All code changes committed to staging branch
- [ ] You have 60 minutes available for deployment
- [ ] You're ready to monitor deployment actively

**When all boxes are checked, run**:

```bash
cd /Users/rupeshsingh/Documents/WorkSpace/digital-astrology-2/digital-astrology/apps/web
bash deploy-to-production.sh
```

---

**Good luck! 🚀**

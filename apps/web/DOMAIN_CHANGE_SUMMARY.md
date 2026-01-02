# Domain Migration Summary: Quick Reference

## 🎯 Migration Overview

**Old Domain**: https://jyotishya.in
**New Domain**: https://www.jyotirvidya.app
**Migration Status**: ✅ Code Changes Complete | ⏳ External Services Pending

---

## ✅ Completed Changes

### 1. Code Changes (All Done)

| File                         | Change                             | Status |
| ---------------------------- | ---------------------------------- | ------ |
| `deploy-to-production.sh`    | Production URL updated             | ✅     |
| `app/layout.tsx`             | Canonical URL updated              | ✅     |
| `app/privacy/page.tsx`       | Email addresses → @jyotirvidya.app | ✅     |
| `app/terms/page.tsx`         | Email addresses → @jyotirvidya.app | ✅     |
| `app/refund-policy/page.tsx` | Email addresses → @jyotirvidya.app | ✅     |
| `.env.example`               | NEXT_PUBLIC_APP_URL updated        | ✅     |

### 2. Email Addresses Updated

All contact emails in legal pages now use `@jyotirvidya.app`:

- privacy@jyotirvidya.app
- legal@jyotirvidya.app
- support@jyotirvidya.app
- dpo@jyotirvidya.app
- grievance@jyotirvidya.app
- refunds@jyotirvidya.app

---

## ⚠️ Required External Configurations

### Must Complete BEFORE Deployment

#### 1. Vercel Domain (15 min)

- [ ] Add `www.jyotirvidya.app` in Vercel Domains
- [ ] Configure DNS (CNAME + A record)
- [ ] Wait for SSL certificate
- [ ] Set as production domain
- [ ] Update environment variables
- **Guide**: See `VERCEL_DOMAIN_SETUP.md`

#### 2. Razorpay Webhook (5 min)

- [ ] Update webhook URL to `https://www.jyotirvidya.app/api/webhooks/razorpay`
- [ ] Verify events enabled
- [ ] Copy webhook secret to Vercel env vars
- **Guide**: See `DOMAIN_MIGRATION_GUIDE.md` → Section 2

#### 3. Vercel Environment Variables (5 min)

- [ ] `NEXT_PUBLIC_APP_URL=https://www.jyotirvidya.app`
- [ ] `RAZORPAY_WEBHOOK_SECRET=[from Razorpay]`
- [ ] Redeploy after changes
- **Guide**: See `VERCEL_DOMAIN_SETUP.md` → Part 5

---

## 📚 Documentation Files Created

| File                         | Purpose                      | When to Use               |
| ---------------------------- | ---------------------------- | ------------------------- |
| `DOMAIN_MIGRATION_GUIDE.md`  | Complete migration reference | Before & after deployment |
| `DEPLOYMENT_VERIFICATION.md` | Quick deployment checklist   | During deployment         |
| `VERCEL_DOMAIN_SETUP.md`     | Step-by-step Vercel setup    | Before deployment         |
| `DOMAIN_CHANGE_SUMMARY.md`   | This file - quick overview   | Reference anytime         |

---

## 🚀 Deployment Workflow

### Phase 1: Pre-Deployment Setup (30 min)

1. **Vercel Domain** (15 min)
   - Add domain in Vercel
   - Configure DNS at registrar
   - Wait for SSL

2. **Razorpay** (5 min)
   - Update webhook URL
   - Copy secret

3. **Vercel Env Vars** (5 min)
   - Add/update variables
   - Redeploy

4. **Verify Prerequisites** (5 min)
   - Check SSL is active
   - Verify DNS propagated
   - Confirm env vars saved

### Phase 2: Run Deployment Script (25 min)

```bash
cd /Users/rupeshsingh/Documents/WorkSpace/digital-astrology-2/digital-astrology/apps/web
bash deploy-to-production.sh
```

**Script will**:

- Stage and commit changes
- Push to staging
- Run smoke tests
- **Pause for your confirmation**
- Merge to main
- Create v0.1.0 tag
- **Pause for Razorpay webhook confirmation**
- Deploy to production
- Run production tests

### Phase 3: Post-Deployment Verification (10 min)

1. Test domain: `curl -I https://www.jyotirvidya.app`
2. Visit legal pages in browser
3. Test API endpoints
4. Verify Razorpay webhook
5. Check Sentry logs
6. Monitor for errors

---

## ⚡ Quick Command Reference

### Test Production URL

```bash
curl -I https://www.jyotirvidya.app
# Expected: HTTP/2 200
```

### Test API Health

```bash
curl https://www.jyotirvidya.app/api/health
curl https://www.jyotirvidya.app/api/ready
```

### Verify DNS

```bash
nslookup www.jyotirvidya.app
dig www.jyotirvidya.app
```

### Check SSL

```bash
openssl s_client -connect www.jyotirvidya.app:443 -servername www.jyotirvidya.app < /dev/null | grep "Verify return code"
```

### Verify Git Tag

```bash
git tag -l | grep v0.1.0
git log main --oneline -3
```

---

## 🔗 Service Dashboard Links

| Service                   | Dashboard URL                            | What to Update                             |
| ------------------------- | ---------------------------------------- | ------------------------------------------ |
| **Vercel**                | https://vercel.com/dashboard             | Domain, env vars                           |
| **Razorpay**              | https://dashboard.razorpay.com/          | Webhook URL                                |
| **Sentry**                | https://sentry.io/                       | Monitor errors (optional: allowed domains) |
| **Resend**                | https://resend.com/                      | Email domain (if using email)              |
| **Google Search Console** | https://search.google.com/search-console | Add new property (post-deployment)         |

---

## 🎯 Success Indicators

Deployment succeeded when you see:

✅ **Terminal**:

```
╔════════════════════════════════════════════════════════════════════╗
║              ✅ DEPLOYMENT COMPLETED SUCCESSFULLY ✅               ║
╚════════════════════════════════════════════════════════════════════╝
Production URL:        https://www.jyotirvidya.app
Version:               v0.1.0
```

✅ **Browser**:

- Homepage loads at https://www.jyotirvidya.app
- SSL certificate valid (🔒)
- Legal pages show @jyotirvidya.app emails

✅ **Dashboards**:

- Vercel: Deployment status "Ready"
- Razorpay: Webhook "Active" with new URL
- Sentry: Error rate < 0.1%

---

## 🚨 If Something Goes Wrong

### Quick Rollback

```bash
git checkout main
git revert HEAD --no-edit
git push origin main
# Vercel auto-redeploys to previous version (wait 2-3 min)
```

### Common Issues

| Issue                | Solution                               |
| -------------------- | -------------------------------------- |
| 404 on new domain    | Wait for DNS propagation (10-30 min)   |
| SSL error            | Click "Retry SSL" in Vercel Domains    |
| Webhook fails        | Verify URL exactly matches in Razorpay |
| Env vars not working | Redeploy in Vercel after changing vars |

---

## 📊 DNS Records Reference

Your DNS registrar should have these records:

```
Type    Name    Value                       TTL
----------------------------------------------------
CNAME   www     cname.vercel-dns.com.      3600
A       @       76.76.21.21                 3600
```

---

## ✅ Final Pre-Deployment Checklist

Before running `bash deploy-to-production.sh`:

- [ ] Vercel domain `www.jyotirvidya.app` added
- [ ] DNS records configured at registrar
- [ ] SSL certificate shows "Active" in Vercel
- [ ] Domain set as "Production" in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` updated in Vercel env vars
- [ ] Razorpay webhook URL updated
- [ ] `RAZORPAY_WEBHOOK_SECRET` added to Vercel env vars
- [ ] Vercel redeployed after env var changes
- [ ] Test domain loads: `curl -I https://www.jyotirvidya.app`

**All checks passed?** → Run deployment script! 🚀

---

## 📞 Need Help?

1. **Detailed Guides**: See documentation files listed above
2. **Vercel Support**: https://vercel.com/support
3. **DNS Checker**: https://dnschecker.org/
4. **SSL Checker**: https://www.ssllabs.com/ssltest/

---

**Domain Migration Ready!** ✅

Last Updated: 2025-01-XX

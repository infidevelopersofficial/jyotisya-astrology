# Domain Migration Guide: jyotishya.in → www.jyotirvidya.app

## Overview

This guide documents the complete migration from `jyotishya.in` to `www.jyotirvidya.app` for the Jyotishya production deployment.

**Migration Date**: January 2025
**Old Domain**: https://jyotishya.in
**New Domain**: https://www.jyotirvidya.app

---

## ✅ Completed Code Changes

### 1. Deployment Script Updated

**File**: `deploy-to-production.sh`

- ✅ Line 28: Changed `PRODUCTION_URL` from `https://jyotishya.in` to `https://www.jyotirvidya.app`
- ✅ Line 414: Updated release notes to reference new production URL
- ✅ Webhook instructions automatically use `$PRODUCTION_URL` variable (no manual change needed)

### 2. Canonical URL Updated

**File**: `app/layout.tsx`

- ✅ Line 20: Changed canonical URL from `https://www.jyotishya.in` to `https://www.jyotirvidya.app`
- This affects SEO and ensures search engines index the correct domain

### 3. Email Addresses Updated

**Files Updated**:

- ✅ `app/privacy/page.tsx` - All email addresses updated to `@jyotirvidya.app`
- ✅ `app/terms/page.tsx` - All email addresses updated to `@jyotirvidya.app`
- ✅ `app/refund-policy/page.tsx` - All email addresses updated to `@jyotirvidya.app`

**Email Addresses Changed**:

- `privacy@jyotishya.com` → `privacy@jyotirvidya.app`
- `legal@jyotishya.com` → `legal@jyotirvidya.app`
- `support@jyotishya.com` → `support@jyotirvidya.app`
- `dpo@jyotishya.com` → `dpo@jyotirvidya.app`
- `grievance@jyotishya.com` → `grievance@jyotirvidya.app`
- `refunds@jyotishya.com` → `refunds@jyotirvidya.app`

### 4. Environment Variables Updated

**File**: `.env.example`

- ✅ Line 96: Changed `NEXT_PUBLIC_APP_URL` from `https://your-app.vercel.app` to `https://www.jyotirvidya.app`

---

## 🔧 Required External Service Configurations

### 1. Vercel Domain Configuration

#### Step 1: Add Custom Domain

1. Go to https://vercel.com/dashboard
2. Select your project (digital-astrology or jyotishya)
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `www.jyotirvidya.app`
6. Click **Add**

#### Step 2: Configure DNS Records

Vercel will show you the DNS records you need to configure:

**If your domain registrar is Vercel** (easiest):

- DNS is automatically configured ✅

**If using external registrar (GoDaddy, Namecheap, etc.)**:

1. Log in to your domain registrar
2. Go to DNS Management for `jyotirvidya.app`
3. Add these records:

```
Type    Name    Value                           TTL
------------------------------------------------------
CNAME   www     cname.vercel-dns.com.          3600
A       @       76.76.21.21                     3600
```

4. Save changes
5. Return to Vercel and click **Refresh** to verify DNS

#### Step 3: Verify SSL Certificate

1. Vercel automatically provisions SSL certificate from Let's Encrypt
2. Wait 1-2 minutes for certificate issuance
3. You should see **SSL: Active** in the domains list
4. If SSL fails, click **Retry SSL** button

#### Step 4: Set as Production Domain

1. In Vercel Domains settings
2. Find `www.jyotirvidya.app` in the list
3. Click the **...** menu
4. Select **Set as Production Domain**
5. Confirm the change

#### Step 5: Redirect Apex Domain (Optional)

To redirect `jyotirvidya.app` → `www.jyotirvidya.app`:

1. Add `jyotirvidya.app` as another domain
2. Vercel will automatically redirect apex to www

---

### 2. Razorpay Webhook Configuration

**⚠️ CRITICAL - Payment webhooks will NOT work until this is updated!**

#### Step 1: Log in to Razorpay Dashboard

1. Go to: https://dashboard.razorpay.com/
2. Log in with your credentials
3. Switch to **Live Mode** (top-left toggle)

#### Step 2: Update Webhook URL

1. Navigate to: **Settings** (⚙️) → **Webhooks**
2. Find your existing webhook or click **+ New Webhook**
3. **Update Webhook URL to**:
   ```
   https://www.jyotirvidya.app/api/webhooks/razorpay
   ```
4. Ensure these events are enabled:
   - ☑ `payment.authorized`
   - ☑ `payment.captured`
   - ☑ `payment.failed`
   - ☑ `order.paid`
5. Copy the **Webhook Secret** (you'll need this for .env)
6. Click **Save** or **Update**

#### Step 3: Test Webhook

1. Click **Send Test Webhook** in Razorpay dashboard
2. Select event: `payment.authorized`
3. Click **Send**
4. Verify in Sentry dashboard that webhook was received

#### Step 4: Update Webhook Secret in Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `RAZORPAY_WEBHOOK_SECRET` (or add it if missing)
3. Update with the secret from Razorpay dashboard
4. Set for: **Production** environment
5. Click **Save**
6. Redeploy production (required for env changes to take effect)

---

### 3. Sentry Configuration

#### Option 1: No Changes Required (Recommended)

If your Sentry DSN is already configured in Vercel environment variables, no changes needed. Sentry automatically tracks by environment, not domain.

#### Option 2: Update Allowed Domains (Optional)

If you have configured allowed domains in Sentry:

1. Go to: https://sentry.io/
2. Navigate to your project (jyotishya)
3. Go to **Settings** → **Security & Privacy** → **Allowed Domains**
4. Add: `www.jyotirvidya.app`
5. Remove: `jyotishya.in` (if present)
6. Click **Save**

---

### 4. Email Service Configuration (Resend)

#### Update Sender Domain

1. Go to: https://resend.com/domains
2. Click **Add Domain**
3. Enter: `jyotirvidya.app`
4. Add these DNS records to your registrar:

```
Type     Name              Value                               TTL
--------------------------------------------------------------------
TXT      @                 v=spf1 include:_spf.resend.com ~all 3600
CNAME    resend._domainkey resend._domainkey.resend.com       3600
CNAME    em                em.resend.com                       3600
```

5. Wait 24-48 hours for DNS propagation
6. Click **Verify Domain** in Resend dashboard
7. Status should change to **Verified** ✅

#### Update "From" Email Addresses

Update your email sending code to use new domain:

```typescript
// OLD
from: "noreply@jyotishya.com";

// NEW
from: "noreply@jyotirvidya.app";
```

**Files to check** (if email sending is implemented):

- `app/api/emails/` (if exists)
- Search for: `@jyotishya.com` in codebase

---

### 5. Google Search Console

#### Add New Property

1. Go to: https://search.google.com/search-console
2. Click **Add Property**
3. Select **URL prefix**
4. Enter: `https://www.jyotirvidya.app`
5. Click **Continue**

#### Verify Ownership

**Method 1: DNS Verification (Recommended)**

1. Google will provide a TXT record
2. Add to your domain registrar's DNS settings
3. Return to Search Console and click **Verify**

**Method 2: HTML Tag**

1. Copy the meta tag provided by Google
2. Add to `app/layout.tsx` in the `<head>` section
3. Deploy to production
4. Return to Search Console and click **Verify**

#### Submit Sitemap

1. After verification, go to **Sitemaps** in the left menu
2. Enter: `https://www.jyotirvidya.app/sitemap.xml`
3. Click **Submit**

#### Request Indexing

1. Go to **URL Inspection**
2. Enter: `https://www.jyotirvidya.app`
3. Click **Request Indexing**
4. Repeat for important pages (privacy, terms, etc.)

---

### 6. Social Media & Analytics

#### Update Open Graph URLs (Future Enhancement)

If you add Open Graph meta tags later, ensure they use new domain:

```tsx
<meta property="og:url" content="https://www.jyotirvidya.app" />
<meta property="og:site_name" content="Jyotirvidya" />
```

#### Google Analytics / Vercel Analytics

- No changes required
- Analytics automatically track by configured domain

---

## 📝 Environment Variables Checklist

### Vercel Production Environment Variables

Ensure these are set in **Vercel Dashboard → Settings → Environment Variables → Production**:

```bash
# Production Domain
NEXT_PUBLIC_APP_URL=https://www.jyotirvidya.app

# Razorpay (Production Keys)
RAZORPAY_KEY_ID=rzp_live_XXXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=XXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXX

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://XXXXX@sentry.io/XXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=XXXXX

# Resend Email
RESEND_API_KEY=re_XXXXX

# Database
DATABASE_URL=postgresql://...

# Other services (as configured)
ASTRO_PYTHON_SERVICE_URL=https://...
JYOTISH_API_URL=https://api.freeastrologyapi.com
JYOTISH_API_KEY=XXXXX
OPENAI_API_KEY=sk-XXXXX
```

**Important**: After updating environment variables in Vercel, you **must redeploy** for changes to take effect!

---

## 🔍 Verification Checklist

### Pre-Deployment Verification

- [ ] ✅ All code changes committed to `staging` branch
- [ ] ✅ `deploy-to-production.sh` updated with new domain
- [ ] ✅ `app/layout.tsx` canonical URL updated
- [ ] ✅ All email addresses in legal pages updated
- [ ] ✅ `.env.example` updated
- [ ] ✅ Vercel domain added and DNS configured
- [ ] ✅ Vercel SSL certificate active
- [ ] ✅ Razorpay webhook URL updated
- [ ] ✅ Sentry allowed domains updated (if applicable)
- [ ] ✅ Email domain configured in Resend (if applicable)

### Post-Deployment Verification

#### 1. Domain Accessibility

```bash
# Test production URL
curl -I https://www.jyotirvidya.app

# Expected: HTTP/2 200
```

```bash
# Test apex domain redirect (if configured)
curl -I https://jyotirvidya.app

# Expected: HTTP/2 301 or 308 (redirect to www)
```

#### 2. SSL Certificate

```bash
# Check SSL certificate
openssl s_client -connect www.jyotirvidya.app:443 -servername www.jyotirvidya.app < /dev/null

# Look for: "Verify return code: 0 (ok)"
```

#### 3. Legal Pages

Visit in browser:

- [ ] https://www.jyotirvidya.app/privacy
- [ ] https://www.jyotirvidya.app/terms
- [ ] https://www.jyotirvidya.app/refund-policy

Verify:

- [ ] All pages load correctly
- [ ] Email addresses show `@jyotirvidya.app`
- [ ] No broken links

#### 4. API Endpoints

```bash
# Health check
curl https://www.jyotirvidya.app/api/health
# Expected: {"status":"ok"}

# Ready check
curl https://www.jyotirvidya.app/api/ready
# Expected: {"status":"ok","timestamp":"..."}

# Webhook endpoint (should reject GET)
curl -I https://www.jyotirvidya.app/api/webhooks/razorpay
# Expected: 405 Method Not Allowed
```

#### 5. Razorpay Webhook Test

1. Go to Razorpay Dashboard → Webhooks
2. Click **Send Test Webhook**
3. Select event: `payment.authorized`
4. Click **Send**
5. Check Sentry dashboard for webhook breadcrumb
6. Expected: "Razorpay webhook received: payment.authorized"

#### 6. Canonical URL

```bash
# Check meta tag
curl -s https://www.jyotirvidya.app | grep 'canonical'

# Expected output should contain:
# <link rel="canonical" href="https://www.jyotirvidya.app"/>
```

#### 7. Cookie Banner

1. Open https://www.jyotirvidya.app in incognito mode
2. Verify cookie banner appears
3. Click "Accept All"
4. Refresh page
5. Verify banner doesn't reappear
6. Check localStorage for `jyotishya-cookie-consent` key

#### 8. Email Deliverability (if configured)

1. Trigger a test email (password reset, welcome email, etc.)
2. Check email received successfully
3. Verify "From" address shows `@jyotirvidya.app`
4. Check email doesn't land in spam

#### 9. Sentry Monitoring

1. Visit https://sentry.io/
2. Navigate to jyotishya project
3. Check **Issues** for last 1 hour
4. Verify no new critical errors
5. Check breadcrumbs show new domain

#### 10. Search Console

1. Wait 24-48 hours after deployment
2. Check Google Search Console
3. Verify no indexing errors
4. Check sitemap was processed successfully

---

## 🚨 Rollback Procedure

If something goes wrong with the domain migration:

### Option 1: Quick Revert (Code Only)

```bash
# 1. Revert the deployment
cd /Users/rupeshsingh/Documents/WorkSpace/digital-astrology-2/digital-astrology/apps/web
git checkout main
git revert HEAD --no-edit
git push origin main

# 2. Wait for Vercel to redeploy (2-3 minutes)
```

### Option 2: Full Rollback (Domain + Code)

1. **Vercel**: Change production domain back to old domain
2. **Razorpay**: Update webhook URL back to old domain
3. **Git**: Revert code changes as shown above
4. **DNS**: Point domain back to original configuration

---

## 📊 Search-Replace Command Summary

For quick reference, here are all the search-replace operations performed:

| File                         | Old Value                     | New Value                     | Type         |
| ---------------------------- | ----------------------------- | ----------------------------- | ------------ |
| `deploy-to-production.sh`    | `https://jyotishya.in`        | `https://www.jyotirvidya.app` | URL          |
| `app/layout.tsx`             | `https://www.jyotishya.in`    | `https://www.jyotirvidya.app` | URL          |
| `app/privacy/page.tsx`       | `@jyotishya.com`              | `@jyotirvidya.app`            | Email domain |
| `app/terms/page.tsx`         | `@jyotishya.com`              | `@jyotirvidya.app`            | Email domain |
| `app/refund-policy/page.tsx` | `@jyotishya.com`              | `@jyotirvidya.app`            | Email domain |
| `.env.example`               | `https://your-app.vercel.app` | `https://www.jyotirvidya.app` | URL          |

---

## 🔗 Quick Reference Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Razorpay Dashboard**: https://dashboard.razorpay.com/
- **Sentry Dashboard**: https://sentry.io/
- **Resend Dashboard**: https://resend.com/
- **Google Search Console**: https://search.google.com/search-console
- **Production URL**: https://www.jyotirvidya.app

---

## ✅ Final Pre-Deployment Checklist

Before running `bash deploy-to-production.sh`:

- [ ] All code changes reviewed and tested locally
- [ ] Vercel domain `www.jyotirvidya.app` added and DNS configured
- [ ] Vercel SSL certificate is active (shows "SSL: Active")
- [ ] Vercel production domain set to `www.jyotirvidya.app`
- [ ] Razorpay webhook URL updated to `https://www.jyotirvidya.app/api/webhooks/razorpay`
- [ ] Razorpay webhook secret added to Vercel environment variables
- [ ] All Vercel production environment variables verified
- [ ] Email domain configured in Resend (if using email)
- [ ] Sentry allowed domains updated (if applicable)
- [ ] Local `.env.local` file updated (for testing)
- [ ] Deployment script tested on staging first

**When all checkboxes are ✅, you're ready to deploy!**

```bash
cd /Users/rupeshsingh/Documents/WorkSpace/digital-astrology-2/digital-astrology/apps/web
bash deploy-to-production.sh
```

---

**Migration Completed**: ✅ Code changes complete, ready for external service configuration
**Document Version**: 1.0.0
**Last Updated**: 2025-01-XX

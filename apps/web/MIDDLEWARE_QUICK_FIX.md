# QUICK FIX: Middleware 500 Error

## 🚨 Problem

`500: INTERNAL_SERVER_ERROR - MIDDLEWARE_INVOCATION_FAILED` on staging deployment

## ✅ Solution Applied

Added environment variable validation to prevent crashes in Edge Runtime

---

## 📋 Action Checklist

### ✅ Step 1: Code Fix Applied

- [x] Updated `lib/supabase/middleware.ts` with error handling
- [x] Added environment variable validation
- [x] Added try-catch for resilience

### ⏳ Step 2: Set Environment Variables in Vercel

**CRITICAL**: You MUST add these environment variables in Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project (digital-astrology or web)
3. Go to: **Settings** → **Environment Variables**
4. Add these variables:

| Variable                        | Value                              | Environments                     |
| ------------------------------- | ---------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key)      | Production, Preview, Development |

**Get values from**:

- Supabase Dashboard: https://supabase.com/dashboard
- Your Project → Settings → API
- Copy "Project URL" and "anon public" key

5. Click **Save**
6. **REDEPLOY** project (required for env vars to take effect)

---

## 🧪 Local Testing

Test the fix locally before deploying:

```bash
# Run verification script
bash test-middleware-fix.sh

# OR manually test:
yarn dev

# Open browser
open http://localhost:3000

# Check for errors in console
```

**Expected**: App should load without 500 errors

---

## 🚀 Deployment

After setting Vercel environment variables:

```bash
# Commit the fix
git add lib/supabase/middleware.ts
git commit -m "fix(middleware): add environment variable validation to prevent crashes"

# Push to staging
git push origin staging

# Wait for Vercel deployment (~2 minutes)
```

---

## ✅ Verification

Test staging after deployment:

```bash
# Test staging URL
curl -I https://jyotisya-astrology-web-git-main-infi-developers.vercel.app

# Expected: HTTP/2 200 (not 500)
```

Visit in browser:

- https://jyotisya-astrology-web-git-main-infi-developers.vercel.app
- Should load homepage
- No 500 error

---

## 🔍 Troubleshooting

### Still getting 500 error?

1. **Check env vars are set for Preview environment** (not just Production)
2. **Redeploy** after adding env vars
3. Check Vercel deployment logs:
   - Go to: Vercel Dashboard → Deployments → Latest → Logs
   - Look for "[Middleware] Missing Supabase environment variables"

### Works locally but not on Vercel?

1. Verify env vars spelling (case-sensitive)
2. Ensure values don't have extra spaces
3. Try: Vercel Dashboard → Settings → Environment Variables → Edit → Save → Redeploy

---

## 📊 What Changed

**File**: `lib/supabase/middleware.ts`

**Changes**:

1. ✅ Added environment variable validation (lines 7-24)
2. ✅ Early return if vars missing (prevents crash)
3. ✅ Try-catch around Supabase client creation (lines 30-56)
4. ✅ Graceful error logging (doesn't crash app)

**Impact**:

- App loads even if env vars missing (degraded mode)
- Clear error messages in console
- No more 500 INTERNAL_SERVER_ERROR

---

## ⏰ Estimated Time

- Code fix: **✅ Done**
- Set Vercel env vars: **5 minutes**
- Redeploy + verify: **5 minutes**
- **Total: 10 minutes**

---

## 🎯 Next Steps

1. ✅ Code fix applied
2. ⏳ **Set environment variables in Vercel** ← DO THIS NOW
3. ⏳ Redeploy to staging
4. ⏳ Verify staging works
5. ⏳ Continue with production deployment

---

**Once staging is working, you can continue with the production deployment script!** 🚀

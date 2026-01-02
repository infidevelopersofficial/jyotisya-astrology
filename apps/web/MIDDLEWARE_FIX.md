# Middleware Error Fix: MIDDLEWARE_INVOCATION_FAILED

## Problem Summary

**Error**: `500: INTERNAL_SERVER_ERROR - MIDDLEWARE_INVOCATION_FAILED`
**Root Cause**: Missing Supabase environment variables in Vercel staging deployment
**Impact**: Entire application unreachable (middleware crashes on all routes)

---

## Root Cause Analysis

### Issue Location

**File**: `lib/supabase/middleware.ts`
**Lines**: 11-13

### Problematic Code

```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // ← Non-null assertion crashes if undefined
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ← Non-null assertion crashes if undefined
  {
    cookies: {
      /* ... */
    },
  },
);
```

### Why It Fails

1. **Edge Runtime**: Middleware runs on Vercel Edge Runtime
2. **No Env Vars**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set in Vercel
3. **Non-null Assertion**: The `!` operator assumes values exist, crashes when undefined
4. **Unhandled Error**: No try-catch, error propagates to Edge Runtime causing 500

---

## The Fix

### Step 1: Add Environment Variable Validation

**File**: `lib/supabase/middleware.ts`

**BEFORE** (Lines 6-37):

```typescript
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

**AFTER** (WITH ERROR HANDLING):

```typescript
export async function updateSession(request: NextRequest) {
  // STEP 1: Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Middleware] Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      env: process.env.NODE_ENV,
    });

    // Return early without crashing - allows app to load without auth
    return NextResponse.next({
      request,
    });
  }

  // STEP 2: Create response object
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    // STEP 3: Create Supabase client with validated env vars
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // STEP 4: Refresh session (non-blocking)
    await supabase.auth.getUser();
  } catch (error) {
    // STEP 5: Handle errors gracefully
    console.error("[Middleware] Supabase session update failed:", error);
    // Continue without auth - better than crashing
  }

  return supabaseResponse;
}
```

---

## Required Environment Variables

### Vercel Project Settings

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables for **ALL environments** (Production, Preview, Development):

| Variable Name                   | Value                              | Environment                      |
| ------------------------------- | ---------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key)      | Production, Preview, Development |

**CRITICAL**: After adding variables, **redeploy** for changes to take effect!

### How to Get Values

1. **Log in to Supabase**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to**: Settings → API
4. **Copy**:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → anon/public** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Deployment Steps

### Step 1: Apply Code Fix

```bash
# The code fix has been provided above
# Replace the content of lib/supabase/middleware.ts with the AFTER version
```

### Step 2: Test Locally

```bash
# Ensure .env.local has these variables
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here" >> .env.local

# Run dev server
yarn dev

# Test in browser
open http://localhost:3000

# Check console for errors
```

### Step 3: Update Vercel Environment Variables

```bash
# Via Vercel CLI (optional)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Or use Vercel Dashboard (recommended)
# https://vercel.com/[team]/[project]/settings/environment-variables
```

### Step 4: Redeploy to Staging

```bash
git add lib/supabase/middleware.ts
git commit -m "fix(middleware): add environment variable validation to prevent crashes"
git push origin staging

# Wait for Vercel deployment (~2 minutes)
# Check staging URL - error should be resolved
```

### Step 5: Verify Fix

```bash
# Test staging URL
curl -I https://jyotisya-astrology-web-git-main-infi-developers.vercel.app

# Expected: HTTP/2 200 (not 500)
```

---

## Troubleshooting Guide

### Issue: Still getting 500 error after adding env vars

**Solution**:

1. Verify env vars are set for **Preview** environment (not just Production)
2. **Redeploy** the project (env vars don't apply to existing deployments)
3. Check Vercel deployment logs for other errors

### Issue: Env vars not showing in Vercel

**Solution**:

1. Check you're in the correct Vercel project
2. Verify you have admin access
3. Try adding via Vercel CLI: `vercel env pull`

### Issue: Auth not working even with env vars

**Solution**:

1. Verify Supabase project is active
2. Check Supabase Dashboard → Settings → API shows correct URL
3. Regenerate anon key if needed
4. Check Supabase project billing status

### Issue: Works locally but not on Vercel

**Solution**:

1. Ensure env vars are set for **Preview** environment
2. Check if using different Supabase project for production
3. Verify no typos in environment variable names
4. Try: `vercel env ls` to list all vars

---

## Verification Checklist

After applying the fix:

- [ ] ✅ Code updated in `lib/supabase/middleware.ts`
- [ ] ✅ Environment variables added to Vercel (Preview + Production)
- [ ] ✅ Local test passes (`yarn dev` works)
- [ ] ✅ Staging deployment succeeds
- [ ] ✅ Staging URL returns 200 (not 500)
- [ ] ✅ Can navigate to `/privacy`, `/terms`, `/dashboard`
- [ ] ✅ No console errors in browser DevTools
- [ ] ✅ Vercel deployment logs show no middleware errors

---

## Additional Improvements (Optional)

### 1. Add Middleware Health Check

Create a simple health endpoint to verify middleware:

**File**: `app/api/middleware-health/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    status: hasSupabaseUrl && hasSupabaseKey ? "ok" : "missing_env_vars",
    env_check: {
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasSupabaseKey,
    },
    timestamp: new Date().toISOString(),
  });
}
```

Test: `curl https://your-app.vercel.app/api/middleware-health`

### 2. Add Sentry Error Tracking

**File**: `lib/supabase/middleware.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

// In the catch block:
catch (error) {
  console.error('[Middleware] Supabase session update failed:', error);
  Sentry.captureException(error, {
    tags: { location: 'middleware_updateSession' },
  });
}
```

---

## Summary

**Problem**: Missing environment variables causing middleware to crash
**Solution**: Add validation + error handling + set env vars in Vercel
**Impact**: Fixes 500 error, allows application to load
**Next Step**: Apply fix → Set env vars → Redeploy → Verify

**Estimated Fix Time**: 10 minutes

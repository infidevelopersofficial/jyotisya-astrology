# React API Fetch Error Troubleshooting Guide

## Error Summary

**Error**: `net::ERR_CONNECTION_REFUSED` + `TypeError: Failed to fetch`
**Location**: `apps/web/components/consultation/astrologer-list.tsx:45`
**Trigger**: useEffect hook calling `fetchAstrologers()`
**Impact**: Repeated failures preventing astrologer list from loading

---

## Root Cause Analysis

### Primary Issue: Backend Server Not Running

The `net::ERR_CONNECTION_REFUSED` error occurs when the browser cannot establish a connection to the backend server. This is the **most common cause** of this error.

**Symptoms**:

- Console shows `Failed to fetch` errors
- Network tab shows failed requests with status `(failed)`
- Error message: "net::ERR_CONNECTION_REFUSED"

**Solution**:

```bash
# Start the Next.js development server
cd /path/to/digital-astrology-2/digital-astrology
npm run dev
# or
yarn dev

# Server should start on http://localhost:3000
```

**Verification**:

```bash
# Check if port 3000 is in use
lsof -i :3000

# Or use curl to test the API
curl http://localhost:3000/api/astrologers
```

---

### Secondary Issues in Code

#### 1. Unstable useEffect Dependency

**Problem** (BEFORE):

```typescript
useEffect(() => {
  if (!initialAstrologers.length) {
    fetchAstrologers();
  }
}, [initialAstrologers]); // ⚠️ Can cause infinite loops
```

**Why it's problematic**:

- If parent component doesn't memoize the array, it creates a new reference on every render
- Each new array reference triggers the useEffect
- Can cause infinite fetch loops

**Solution** (AFTER):

```typescript
useEffect(() => {
  if (!initialAstrologers.length) {
    const abortController = new AbortController();
    fetchAstrologers(abortController.signal);

    return () => {
      abortController.abort();
    };
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Run only once on mount
```

**Benefits**:

- Runs only once when component mounts
- Abort controller cancels in-flight requests on unmount
- Prevents memory leaks and duplicate requests

---

#### 2. Missing Abort Signal Handling

**Problem** (BEFORE):

```typescript
const fetchAstrologers = async () => {
  const response = await fetch("/api/astrologers");
  // No way to cancel this request
};
```

**Why it's problematic**:

- Request continues even if component unmounts
- Can cause memory leaks
- Updates state on unmounted components (React warnings)

**Solution** (AFTER):

```typescript
const fetchAstrologers = async (signal?: AbortSignal) => {
  try {
    const response = await fetch("/api/astrologers", {
      signal, // Allows cancellation
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ... rest of code
  } catch (err) {
    // Ignore abort errors
    if (err instanceof Error && err.name === "AbortError") {
      console.log("Fetch aborted - component unmounted");
      return;
    }
    // Handle other errors
  }
};
```

---

#### 3. Poor Error Messaging

**Problem** (BEFORE):

```typescript
catch (err) {
  setError('Failed to load astrologers. Please try again.')
}
```

**Why it's problematic**:

- Generic error doesn't help users understand the issue
- No distinction between server errors and network errors

**Solution** (AFTER):

```typescript
catch (err) {
  if (err instanceof Error && err.name === 'AbortError') {
    return // Ignore cancellations
  }

  // Specific error for connection failures
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    setError('Cannot connect to server. Please ensure the development server is running.')
  } else {
    setError(err instanceof Error ? err.message : 'Failed to load astrologers. Please try again.')
  }
}
```

---

## Why Errors Repeat (React StrictMode)

### React 18 StrictMode Behavior

React 18's StrictMode intentionally **double-mounts** components in development to help detect side effects:

```
1. Component mounts → useEffect runs → fetchAstrologers()
2. Component unmounts (StrictMode cleanup)
3. Component remounts → useEffect runs again → fetchAstrologers()
```

This causes the error to appear **twice in the console**.

**This is NORMAL in development** and won't happen in production builds.

**Visual Example**:

```
Console Output:
GET http://localhost:3000/api/astrologers net::ERR_CONNECTION_REFUSED
GET http://localhost:3000/api/astrologers net::ERR_CONNECTION_REFUSED
                                          ↑ Same error twice due to StrictMode
```

**How to verify**:

1. Check if errors appear in pairs
2. Look for "StrictMode" in React DevTools
3. Temporarily disable StrictMode to test:

```typescript
// apps/web/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Remove <React.StrictMode> wrapper for testing */}
        {children}
      </body>
    </html>
  )
}
```

⚠️ **Don't disable StrictMode in production** - it helps catch bugs!

---

## Complete Step-by-Step Troubleshooting

### Step 1: Verify Server is Running

```bash
# Check if Next.js is running
lsof -i :3000

# If nothing is running, start the server
cd digital-astrology
npm run dev

# Expected output:
# ▲ Next.js 14.1.4
# - Local:        http://localhost:3000
# - Environments: .env.local
```

### Step 2: Test API Endpoint Directly

```bash
# Test the API endpoint
curl http://localhost:3000/api/astrologers

# Expected response (if DB is seeded):
# {
#   "success": true,
#   "astrologers": [...],
#   "total": 5
# }

# If you get an error, check database connection
```

### Step 3: Verify Database Connection

```bash
# Check if DATABASE_URL is set
cat apps/web/.env.local | grep DATABASE_URL

# Test database connection
cd packages/schemas
npx prisma db pull  # Should succeed if connection works

# If no data, seed the database
npm run seed
```

### Step 4: Check Network Tab in Browser

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for the `/api/astrologers` request

**Healthy request**:

- Status: `200 OK`
- Response: JSON with astrologers array
- Size: > 0 bytes

**Failed request**:

- Status: `(failed)` or `ERR_CONNECTION_REFUSED`
- Response: Empty
- Size: 0 bytes

### Step 5: Verify Code Changes Applied

Check that the fixes are in place:

```typescript
// apps/web/components/consultation/astrologer-list.tsx

// ✅ Correct - Empty dependency array
useEffect(() => {
  if (!initialAstrologers.length) {
    const abortController = new AbortController();
    fetchAstrologers(abortController.signal);
    return () => abortController.abort();
  }
}, []); // ← Should be empty array

// ✅ Correct - Accepts signal parameter
const fetchAstrologers = async (signal?: AbortSignal) => {
  // ...
  const response = await fetch("/api/astrologers", {
    signal, // ← Should be present
    // ...
  });
};
```

---

## Common Scenarios & Solutions

### Scenario 1: Server Running, Still Getting Connection Error

**Possible causes**:

1. Server is on different port (check console for actual port)
2. Proxy misconfiguration
3. Firewall blocking localhost

**Solutions**:

```bash
# 1. Check actual port from server logs
npm run dev | grep "Local:"

# 2. If server is on port 3001, update fetch URL
# OR use relative URLs (already doing this ✅)

# 3. Test with fetch in browser console
fetch('/api/astrologers').then(r => r.json()).then(console.log)
```

### Scenario 2: Database Connection Errors

**Error in API logs**:

```
PrismaClientInitializationError: Can't reach database server
```

**Solutions**:

```bash
# 1. Check DATABASE_URL
cat apps/web/.env.local

# 2. Verify database is running
# For PostgreSQL:
pg_isready

# For MySQL:
mysqladmin ping

# 3. Test connection with Prisma
cd packages/schemas
npx prisma db pull
```

### Scenario 3: Empty Astrologers Array

**Symptom**: Request succeeds but returns empty array

**Solutions**:

```bash
# Check if database has data
cd packages/schemas
npx prisma studio  # Opens GUI to view data

# Or check via console
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM Astrologer;"

# If empty, seed the database
npm run seed
```

### Scenario 4: CORS Errors (If using separate backend)

**Error**:

```
Access to fetch at 'http://api.example.com' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution**:

```typescript
// apps/web/next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://your-backend-url/api/:path*",
      },
    ];
  },
};
```

---

## Testing the Fix

### 1. Start Clean

```bash
# Kill any running servers
pkill -f next

# Clear Next.js cache
rm -rf .next

# Restart server
npm run dev
```

### 2. Monitor Console

Open browser DevTools and watch for:

- ✅ No repeated errors
- ✅ Successful API response
- ✅ Astrologers rendering on page

### 3. Test Component Lifecycle

```typescript
// Add temporary logging
useEffect(() => {
  console.log("[AstrologerList] Component mounted");

  if (!initialAstrologers.length) {
    const abortController = new AbortController();
    fetchAstrologers(abortController.signal);

    return () => {
      console.log("[AstrologerList] Component unmounting - aborting fetch");
      abortController.abort();
    };
  }
}, []);
```

**Expected console output** (with StrictMode):

```
[AstrologerList] Component mounted
[AstrologerList] Component unmounting - aborting fetch
Fetch aborted - component unmounted
[AstrologerList] Component mounted
```

---

## Prevention Best Practices

### 1. Always Use AbortController for Fetch

```typescript
useEffect(() => {
  const controller = new AbortController();

  fetchData(controller.signal);

  return () => controller.abort();
}, []);
```

### 2. Handle Abort Errors Gracefully

```typescript
catch (err) {
  if (err.name === 'AbortError') return
  // Handle real errors
}
```

### 3. Use Empty Dependency Arrays for One-Time Fetches

```typescript
// ✅ Good - runs once
useEffect(() => {
  fetchData();
}, []);

// ❌ Bad - can run multiple times
useEffect(() => {
  fetchData();
}, [someProp]);
```

### 4. Provide Helpful Error Messages

```typescript
if (err instanceof TypeError && err.message === "Failed to fetch") {
  setError("Server not running. Run: npm run dev");
} else if (err.message.includes("404")) {
  setError("API endpoint not found");
} else {
  setError(err.message);
}
```

### 5. Use React Query or SWR for Data Fetching

Consider using a data-fetching library for production:

```typescript
import { useQuery } from "@tanstack/react-query";

function AstrologerList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["astrologers"],
    queryFn: () => fetch("/api/astrologers").then((r) => r.json()),
    staleTime: 60000, // Cache for 1 minute
  });

  // Automatic error handling, caching, and retries! ✨
}
```

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Check server status
lsof -i :3000

# Test API endpoint
curl http://localhost:3000/api/astrologers

# View database
cd packages/schemas && npx prisma studio

# Seed database
npm run seed

# Check environment variables
cat apps/web/.env.local

# Clear cache and restart
rm -rf .next && npm run dev

# Type check
npm run type-check

# Run tests
npm test
```

---

## Summary of Changes Made

| File                  | Line  | Change                         | Purpose                          |
| --------------------- | ----- | ------------------------------ | -------------------------------- |
| `astrologer-list.tsx` | 36-48 | Updated useEffect dependencies | Prevent re-render loops          |
| `astrologer-list.tsx` | 40    | Added AbortController          | Cancel requests on unmount       |
| `astrologer-list.tsx` | 50    | Added signal parameter         | Support request cancellation     |
| `astrologer-list.tsx` | 55-60 | Added signal to fetch          | Enable cancellation              |
| `astrologer-list.tsx` | 71-74 | Handle AbortError              | Prevent error logging on cleanup |
| `astrologer-list.tsx` | 79-81 | Improved error messages        | Better developer experience      |

---

## Additional Resources

- [React 18 StrictMode](https://react.dev/reference/react/StrictMode)
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Last Updated**: 2025-12-17
**Status**: ✅ Fixed

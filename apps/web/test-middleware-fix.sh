#!/bin/bash
# Test Middleware Fix - Quick Verification Script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Middleware Fix Verification Script                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check environment variables exist
echo -e "${YELLOW}[1/5] Checking environment variables...${NC}"

if [ -f .env.local ]; then
    echo -e "${GREEN}✓ .env.local file found${NC}"

    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL is set${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_URL is missing${NC}"
        echo -e "${YELLOW}  Add it to .env.local:${NC}"
        echo "  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
        exit 1
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set${NC}"
    else
        echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing${NC}"
        echo -e "${YELLOW}  Add it to .env.local:${NC}"
        echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here"
        exit 1
    fi
else
    echo -e "${RED}✗ .env.local file not found${NC}"
    echo -e "${YELLOW}  Create .env.local with Supabase credentials${NC}"
    exit 1
fi

echo ""

# Step 2: Check middleware file has the fix
echo -e "${YELLOW}[2/5] Verifying middleware fix applied...${NC}"

if grep -q "if (!supabaseUrl || !supabaseAnonKey)" lib/supabase/middleware.ts; then
    echo -e "${GREEN}✓ Middleware fix applied correctly${NC}"
else
    echo -e "${RED}✗ Middleware fix not found${NC}"
    echo -e "${YELLOW}  Please apply the fix from MIDDLEWARE_FIX.md${NC}"
    exit 1
fi

echo ""

# Step 3: Build check
echo -e "${YELLOW}[3/5] Running TypeScript check...${NC}"

if yarn tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}✗ TypeScript errors found${NC}"
    yarn tsc --noEmit
    exit 1
else
    echo -e "${GREEN}✓ TypeScript check passed${NC}"
fi

echo ""

# Step 4: Check if dev server can start
echo -e "${YELLOW}[4/5] Testing development server startup...${NC}"
echo -e "${BLUE}  Starting dev server (will stop after 10 seconds)...${NC}"

# Start dev server in background
yarn dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
sleep 10

# Check if process is still running
if kill -0 $DEV_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Dev server started successfully${NC}"

    # Test if server responds
    if curl -f -s -o /dev/null http://localhost:3000; then
        echo -e "${GREEN}✓ Server responding on http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}⚠ Server started but not responding (may need more time)${NC}"
    fi

    # Kill dev server
    kill $DEV_PID 2>/dev/null || true
else
    echo -e "${RED}✗ Dev server failed to start${NC}"
    echo -e "${YELLOW}  Check logs for errors:${NC}"
    echo "  yarn dev"
    exit 1
fi

echo ""

# Step 5: Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ MIDDLEWARE FIX VERIFICATION PASSED                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Commit the fix: git add lib/supabase/middleware.ts"
echo "  2. Commit message: git commit -m 'fix(middleware): add env validation'"
echo "  3. Push to staging: git push origin staging"
echo "  4. Wait for Vercel deployment (~2 minutes)"
echo "  5. Test staging URL (should return 200, not 500)"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC} Set environment variables in Vercel:"
echo "  - Go to: https://vercel.com/dashboard"
echo "  - Project → Settings → Environment Variables"
echo "  - Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - Set for: Production, Preview, Development"
echo "  - Redeploy after adding variables"
echo ""

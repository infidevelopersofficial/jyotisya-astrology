# Vercel Deployment Guide - Next.js Monorepo

## 🎯 Current Configuration

This guide documents the correct Vercel configuration for deploying `@digital-astrology/web` from our Turborepo monorepo.

### Project Structure
```
digital-astrology/                 # Monorepo root
├── turbo.json                     # Turborepo configuration
├── package.json                   # Root package.json
├── vercel.json                    # Root vercel config (for other apps)
└── apps/
    └── web/                       # Next.js application
        ├── vercel.json            # ✅ App-specific Vercel config
        ├── package.json           # App package.json
        ├── next.config.js         # Next.js configuration
        └── .next/                 # Build output (created during build)
```

---

## 📝 Vercel Dashboard Settings

### **Project Settings → General**

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework Preset** | Other | ⚠️ Set to "Other" (not Next.js) to use custom commands |
| **Root Directory** | `apps/web` | ✅ Points to the Next.js app |
| **Build Command** | *(leave empty)* | Uses `vercel.json` instead |
| **Output Directory** | *(leave empty)* | Uses `vercel.json` instead |
| **Install Command** | *(leave empty)* | Uses `vercel.json` instead |

### **Project Settings → Git**

| Setting | Value |
|---------|-------|
| **Include source files outside Root Directory** | ✅ Enabled |

**Why?** The app needs to access workspace dependencies in `packages/` and root-level configuration files.

---

## 🔧 Configuration Files

### `apps/web/vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && turbo build --filter=@digital-astrology/web",
  "installCommand": "yarn install --immutable",
  "framework": null,
  "outputDirectory": ".next",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./"
}
```

**Explanation:**
- `buildCommand`: Navigates to monorepo root (`cd ../..`) before running Turbo
- `installCommand`: Uses Yarn with immutable lockfile (recommended for Vercel)
- `framework: null`: Disables auto-detection to use our custom build
- `outputDirectory: ".next"`: Relative to Root Directory (`apps/web`)
- `ignoreCommand`: Skips deployment if no changes in this app

---

## 🚀 How It Works

### Build Flow

1. **Vercel clones repo** and sets working directory to `apps/web/` (Root Directory)
2. **Install dependencies**: Runs `yarn install --immutable` from `apps/web/`
   - Yarn v3+ workspace hoisting installs all dependencies at root
3. **Build command**: `cd ../.. && turbo build --filter=@digital-astrology/web`
   - Navigates to monorepo root
   - Turbo builds only the web app and its dependencies
   - Output goes to `apps/web/.next/`
4. **Deploy**: Vercel looks for `.next/` (relative to `apps/web/`) and deploys it

---

## 🐛 Common Issues & Fixes

### Issue 1: "No Output Directory named '.next' found"

**Cause:** `outputDirectory` was set to `apps/web/.next` instead of `.next`

**Fix:**
```json
// ❌ Wrong (when Root Directory is apps/web)
"outputDirectory": "apps/web/.next"

// ✅ Correct
"outputDirectory": ".next"
```

**Why?** Vercel's working directory is already `apps/web/`, so paths are relative to it.

---

### Issue 2: "turbo: command not found"

**Cause:** Turbo is installed at root but command runs from `apps/web/`

**Fix:**
```json
// ❌ Wrong
"buildCommand": "turbo build --filter=@digital-astrology/web"

// ✅ Correct
"buildCommand": "cd ../.. && turbo build --filter=@digital-astrology/web"
```

**Why?** `turbo` is in `node_modules/.bin` at root, not in `apps/web/node_modules/`

---

### Issue 3: "Module not found: workspace dependencies"

**Cause:** "Include source files outside Root Directory" is disabled

**Fix:** Enable it in Vercel Dashboard → Settings → Git

**Why?** The app imports from `packages/ui`, `packages/lib`, etc., which are outside `apps/web/`

---

### Issue 4: Build succeeds but deployment fails

**Possible causes:**
1. Missing environment variables
2. Runtime errors during SSR
3. Prisma client not generated

**Check:**
```bash
# Verify all required env vars are set in Vercel Dashboard
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc (see .env.example)
```

---

## 🔍 Debugging Builds

### View Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the failed deployment
3. Check logs for:
   - `Running Build Command`
   - `Detected Next.js version`
   - `Creating an optimized production build`
   - Error messages

### Test Build Locally

```bash
# Simulate Vercel's build
cd apps/web
yarn install --immutable
cd ../..
turbo build --filter=@digital-astrology/web

# Check output
ls -la apps/web/.next
```

---

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] `apps/web/vercel.json` has correct configuration
- [ ] Root Directory = `apps/web` in Vercel Dashboard
- [ ] Framework Preset = "Other" (not Next.js)
- [ ] "Include files outside Root Directory" is enabled
- [ ] All environment variables are set in Vercel
- [ ] Build succeeds locally with `turbo build --filter=@digital-astrology/web`
- [ ] `.next` directory is created in `apps/web/` after build

---

## 🔗 References

- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos/turborepo)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Build Configuration](https://vercel.com/docs/projects/project-configuration)

---

**Last Updated:** 2025-12-22
**Vercel Project:** jyotirvidya / digital-astrology-web

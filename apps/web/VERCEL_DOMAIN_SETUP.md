# Vercel Domain Setup: www.jyotirvidya.app

## Step-by-Step Configuration Guide

**Time Required**: 15-20 minutes
**Prerequisites**:

- Access to Vercel dashboard
- Access to your domain registrar (GoDaddy, Namecheap, etc.)
- Domain `jyotirvidya.app` purchased and ready

---

## Part 1: Add Domain in Vercel (5 minutes)

### Step 1: Access Vercel Dashboard

1. Open browser and go to: https://vercel.com/dashboard
2. Log in with your credentials
3. You should see your projects list

### Step 2: Select Your Project

1. Find your project in the list (likely named "digital-astrology" or "web")
2. Click on the project card to open it
3. You'll see the project overview with recent deployments

### Step 3: Navigate to Domain Settings

1. Click on **Settings** tab (top navigation)
2. In the left sidebar, click **Domains**
3. You'll see any existing domains (like `*.vercel.app`)

### Step 4: Add Custom Domain

1. Click the **Add** or **Add Domain** button
2. In the text input, type: `www.jyotirvidya.app`
3. Click **Add**
4. Vercel will check if the domain is available

### Step 5: Choose Domain Configuration

Vercel will show you one of these screens:

**Option A: "Domain is not configured"**

- This means DNS records need to be added at your registrar
- Vercel will show you the DNS records to add
- Continue to Part 2 below

**Option B: "Domain already in use"**

- This means domain is registered with another Vercel account
- You'll need to remove it from the other account first
- Or contact Vercel support to transfer ownership

**Option C: "Domain added successfully"**

- If you're using Vercel's nameservers, DNS is automatic
- Skip to Part 3 (SSL Configuration)

---

## Part 2: Configure DNS at Your Registrar (10 minutes)

### Step 1: Identify Your Domain Registrar

Common registrars:

- GoDaddy (https://godaddy.com)
- Namecheap (https://namecheap.com)
- Google Domains (https://domains.google)
- Cloudflare (https://cloudflare.com)
- Porkbun (https://porkbun.com)

### Step 2: Log in to Your Registrar

1. Go to your registrar's website
2. Log in with your account
3. Navigate to "My Domains" or "Domain Management"
4. Find `jyotirvidya.app` in the list
5. Click "Manage" or "DNS Settings"

### Step 3: Add DNS Records

Vercel requires these two records:

#### Record 1: CNAME for www subdomain

```
Type:    CNAME
Name:    www
Value:   cname.vercel-dns.com
TTL:     3600 (or Auto/Default)
```

**How to add**:

1. Click "Add Record" or "Add New Record"
2. Select type: **CNAME**
3. Enter Name/Host: `www`
4. Enter Value/Points to: `cname.vercel-dns.com`
5. Set TTL: `3600` or leave as default
6. Click "Save" or "Add Record"

#### Record 2: A Record for apex domain

```
Type:    A
Name:    @ (or leave blank, or enter "jyotirvidya.app")
Value:   76.76.21.21
TTL:     3600 (or Auto/Default)
```

**How to add**:

1. Click "Add Record" again
2. Select type: **A**
3. Enter Name/Host: `@` (some registrars use blank or apex domain)
4. Enter Value/IP Address: `76.76.21.21`
5. Set TTL: `3600` or leave as default
6. Click "Save" or "Add Record"

### Step 4: Save DNS Changes

1. Review both records are correct
2. Click "Save Changes" or "Apply Changes" at the bottom
3. Some registrars auto-save each record

### Step 5: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually propagates within 10-30 minutes
- You can proceed to next steps while waiting

---

## Part 3: Verify and Configure in Vercel (5 minutes)

### Step 1: Return to Vercel

1. Go back to Vercel → Your Project → Settings → Domains
2. Find `www.jyotirvidya.app` in the domains list
3. Look at the status indicator

### Step 2: Refresh DNS Check

If status shows "Pending DNS Configuration":

1. Click the **Refresh** button (🔄 icon)
2. Vercel will re-check DNS records
3. Wait 10-30 seconds for verification

If DNS is still not verified:

- Wait 5-10 more minutes
- Check your DNS records are exactly correct
- Try: `nslookup www.jyotirvidya.app` in terminal
- Try: `dig www.jyotirvidya.app` in terminal

### Step 3: Wait for SSL Certificate

Once DNS is verified, Vercel automatically:

1. Provisions SSL certificate from Let's Encrypt
2. Configures HTTPS for your domain
3. Enables HTTP to HTTPS redirect

**Status indicators**:

- 🟡 **Pending**: DNS not verified yet → wait longer
- 🟢 **Valid**: DNS verified, provisioning SSL → wait 1-2 min
- ✅ **SSL: Active**: Everything working! → proceed to next step

If SSL fails:

1. Click the **...** menu next to domain
2. Select **Retry SSL**
3. Wait 2-3 minutes
4. Refresh page to check status

### Step 4: Set as Production Domain

1. Find `www.jyotirvidya.app` in domains list
2. Click the **...** menu (three dots)
3. Select **Set as Production Domain**
4. Confirm the dialog
5. Vercel will mark it with "Production" badge

**What this does**:

- All production deployments go to this domain
- Git pushes to `main` branch deploy here
- API routes use this domain
- Environment variables for production apply here

---

## Part 4: Configure Apex Domain Redirect (Optional)

To redirect `jyotirvidya.app` → `www.jyotirvidya.app`:

### Step 1: Add Apex Domain

1. In Vercel Domains, click **Add**
2. Enter: `jyotirvidya.app` (without www)
3. Click **Add**

### Step 2: Automatic Redirect

Vercel automatically:

- Detects `jyotirvidya.app` and `www.jyotirvidya.app` are related
- Configures 308 redirect from apex to www
- Uses the A record you already configured

### Step 3: Verify Redirect

```bash
# Test redirect
curl -I https://jyotirvidya.app

# Expected output:
# HTTP/2 308
# Location: https://www.jyotirvidya.app
```

---

## Part 5: Update Environment Variables (5 minutes)

### Step 1: Navigate to Environment Variables

1. In Vercel → Your Project → Settings
2. Click **Environment Variables** in left sidebar
3. You'll see a list of existing variables

### Step 2: Add/Update NEXT_PUBLIC_APP_URL

If variable exists:

1. Find `NEXT_PUBLIC_APP_URL` in list
2. Click **Edit** (pencil icon)
3. Change value to: `https://www.jyotirvidya.app`
4. Ensure **Production** is checked
5. Click **Save**

If variable doesn't exist:

1. Click **Add New Variable** button
2. Enter Key: `NEXT_PUBLIC_APP_URL`
3. Enter Value: `https://www.jyotirvidya.app`
4. Check **Production** (only production, not preview/development)
5. Click **Save**

### Step 3: Add Razorpay Webhook Secret

1. Click **Add New Variable**
2. Enter Key: `RAZORPAY_WEBHOOK_SECRET`
3. Enter Value: `[get from Razorpay dashboard]`
4. Check **Production** only
5. Click **Save**

### Step 4: Verify Other Production Variables

Ensure these are set for **Production**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID` (should start with `rzp_live_`)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (should start with `rzp_live_`)
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_SENTRY_DSN`
- `DATABASE_URL`

### Step 5: Redeploy to Apply Changes

**IMPORTANT**: Environment variable changes require redeployment!

1. Go to **Deployments** tab
2. Find the latest production deployment
3. Click **...** menu → **Redeploy**
4. Confirm redeploy
5. Wait 2-3 minutes for redeployment to complete

---

## Part 6: Verification (5 minutes)

### Test 1: Domain Accessibility

```bash
curl -I https://www.jyotirvidya.app
# Expected: HTTP/2 200
```

Open in browser:

- https://www.jyotirvidya.app
- Should load your app with valid SSL (🔒 icon)

### Test 2: SSL Certificate

In browser:

1. Click the 🔒 padlock icon in address bar
2. Click "Certificate" or "Connection is secure"
3. Verify:
   - Issued to: `www.jyotirvidya.app`
   - Issued by: `Let's Encrypt` or `R3`
   - Valid until: [future date]

### Test 3: Environment Variables

Check if new domain is being used:

```bash
# If your app has a health endpoint
curl https://www.jyotirvidya.app/api/health

# Check response includes correct domain
```

### Test 4: Apex Redirect (if configured)

```bash
curl -I https://jyotirvidya.app
# Expected: HTTP/2 308 with Location: https://www.jyotirvidya.app
```

---

## 🎯 Success Checklist

Vercel configuration is complete when:

- [ ] ✅ Domain `www.jyotirvidya.app` shows in Vercel Domains list
- [ ] ✅ Status shows "SSL: Active" with green checkmark
- [ ] ✅ Domain has "Production" badge
- [ ] ✅ `curl -I https://www.jyotirvidya.app` returns 200
- [ ] ✅ Browser shows valid SSL certificate (🔒 icon)
- [ ] ✅ `NEXT_PUBLIC_APP_URL` environment variable updated
- [ ] ✅ `RAZORPAY_WEBHOOK_SECRET` environment variable added
- [ ] ✅ Production redeployed after env var changes
- [ ] ✅ Apex domain `jyotirvidya.app` redirects to www (optional)

---

## 🚨 Common Issues and Solutions

### Issue: "Domain not found" or 404 Error

**Symptoms**: Visiting domain shows "404: This page could not be found"
**Cause**: DNS not propagated yet
**Solution**:

1. Wait 10-30 minutes for DNS propagation
2. Test DNS with: `nslookup www.jyotirvidya.app`
3. If DNS shows Vercel IP, wait for SSL provisioning
4. Clear browser cache and try again

### Issue: "Invalid Certificate" or SSL Error

**Symptoms**: Browser shows "Your connection is not private"
**Cause**: SSL certificate not issued yet
**Solution**:

1. Go to Vercel Domains
2. Click **...** menu → **Retry SSL**
3. Wait 2-3 minutes
4. Clear browser cache and retry
5. If still fails, check DNS is correctly pointed to Vercel

### Issue: "This domain is already in use"

**Symptoms**: Can't add domain, says it's already registered
**Cause**: Domain is in another Vercel account or project
**Solution**:

1. Check if you have multiple Vercel accounts
2. Search for the domain in all your projects
3. Remove from old project if found
4. Or contact Vercel support to transfer domain

### Issue: Environment variables not working

**Symptoms**: App still uses old domain or old configuration
**Cause**: Forgot to redeploy after updating env vars
**Solution**:

1. Go to Vercel → Deployments
2. Click **...** on latest → **Redeploy**
3. Wait for redeployment to complete
4. Hard refresh browser (Cmd/Ctrl + Shift + R)

### Issue: CSS or assets not loading (mixed content)

**Symptoms**: Page loads but styling broken
**Cause**: HTTP/HTTPS mixed content issues
**Solution**:

1. Check all asset URLs use `https://`
2. Update any hardcoded `http://` URLs
3. Check `next.config.js` asset configuration
4. Clear browser cache and retry

---

## 📞 Support Resources

If you encounter issues not covered here:

1. **Vercel Documentation**: https://vercel.com/docs/concepts/projects/domains
2. **Vercel Support**: https://vercel.com/support (chat available)
3. **DNS Checker**: https://dnschecker.org/ (check propagation globally)
4. **SSL Checker**: https://www.ssllabs.com/ssltest/ (verify SSL config)
5. **Community**: Vercel Discord or GitHub Discussions

---

## ✅ Completion Confirmation

When Vercel configuration is complete:

```
✅ Domain configured: www.jyotirvidya.app
✅ SSL Active: Let's Encrypt certificate
✅ Production domain: Set
✅ Environment variables: Updated
✅ Redeployment: Complete
✅ Ready for deployment script!
```

**Next step**: Proceed to Razorpay webhook configuration (see DOMAIN_MIGRATION_GUIDE.md)

---

**Configuration Guide Complete!** 🎉

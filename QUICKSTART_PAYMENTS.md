# 🚀 Quick Start: Razorpay Payment Integration

**Get your consultation booking system running in 3 minutes!**

---

## ⚡ Setup (One-Time)

### 1. Get Razorpay Test Keys

```bash
# Visit https://dashboard.razorpay.com
# Go to: Settings → API Keys → Generate Test Key
# Copy both Key ID and Key Secret
```

### 2. Configure Environment

```bash
# Edit: apps/web/.env.local

# Replace these values with your actual keys:
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
```

### 3. Seed Test Data

```bash
cd apps/web
npx tsx scripts/seed-astrologers.ts
```

**Output**: Creates 6 sample astrologers in your database

---

## 🎮 Test Payment Flow

### 1. Start Server

```bash
npm run dev
```

### 2. Test Booking

1. **Visit**: http://localhost:3000/consultations
2. **Select**: Any available astrologer
3. **Click**: "Book Consultation" button
4. **Fill Form**:
   - Date: Tomorrow
   - Time: Any time
   - Duration: 30 minutes
5. **Click**: "Proceed to Pay"

### 3. Complete Payment (Test Mode)

**Razorpay modal will open:**

- **Card Number**: `4111 1111 1111 1111`
- **CVV**: `123`
- **Expiry**: `12/25` (any future date)
- **Click**: "Pay Now"

### 4. Verify Success

✅ Redirected to `/consultations/[id]`
✅ Shows "Booking Confirmed!"
✅ Payment status: PAID
✅ Consultation status: SCHEDULED

---

## 🧪 Test Cards

| Card Number         | Result     |
| ------------------- | ---------- |
| 4111 1111 1111 1111 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Decline |

---

## 📂 Key Files

**Backend:**

- `apps/web/lib/payments/razorpay.ts` - Payment functions
- `apps/web/app/api/consultations/create-order/route.ts` - Create order
- `apps/web/app/api/consultations/verify-payment/route.ts` - Verify payment
- `apps/web/app/api/webhooks/razorpay/route.ts` - Webhook handler

**Frontend:**

- `apps/web/app/consultations/page.tsx` - Astrologers list
- `apps/web/components/consultation/booking-modal.tsx` - Booking form
- `apps/web/app/consultations/[id]/page.tsx` - Consultation details

**Config:**

- `apps/web/.env.local` - Razorpay keys
- `apps/web/types/razorpay.d.ts` - TypeScript types

**Utilities:**

- `apps/web/scripts/seed-astrologers.ts` - Sample data

---

## 🎯 Payment Flow

```
User → Select Astrologer → Fill Booking Form →
Razorpay Checkout → Pay with Test Card →
Payment Verified → Consultation Confirmed ✅
```

---

## 🐛 Quick Fixes

**"Razorpay credentials not configured"**
→ Add keys to `.env.local` and restart server

**"No astrologers available"**
→ Run: `npx tsx scripts/seed-astrologers.ts`

**Payment modal doesn't open**
→ Check browser console for script loading errors

---

## 📖 Full Documentation

- **Complete Guide**: `apps/web/docs/RAZORPAY_INTEGRATION.md`
- **Integration Summary**: `apps/web/docs/PAYMENT_INTEGRATION_COMPLETE.md`

---

## ✅ Ready!

Your consultation booking and payment system is **fully operational**.

🎉 Happy Testing!

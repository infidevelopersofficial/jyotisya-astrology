# Razorpay Payment Integration Guide

Complete guide for integrating Razorpay payment gateway for consultation bookings in the Digital Astrology Platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Architecture](#architecture)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing](#testing)
8. [Going Live](#going-live)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Razorpay integration enables secure payment processing for astrology consultation bookings. The system handles:

- **Order Creation**: Creates Razorpay payment orders with consultation details
- **Payment Verification**: Validates payment signatures using HMAC SHA256
- **Webhook Handling**: Processes async payment status updates from Razorpay
- **Refund Support**: Handles full and partial refunds for consultations

### Payment Flow

```
1. User selects astrologer and schedules consultation
2. Backend creates Razorpay order + Consultation record (PENDING status)
3. Frontend shows Razorpay checkout UI
4. User completes payment
5. Frontend sends payment details to verification endpoint
6. Backend verifies signature and updates Consultation status to PAID
7. Razorpay sends webhook for async confirmation
```

---

## Setup

### 1. Get Razorpay API Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Generate API keys:
   - **Test Mode**: For development (keys start with `rzp_test_`)
   - **Live Mode**: For production (keys start with `rzp_live_`)

### 2. Configure Environment Variables

Add to `apps/web/.env.local`:

```bash
# Test Mode (Development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_key_here

# Live Mode (Production) - Use separate keys
# RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=your_live_secret_key_here
```

**Security Note**:
- ✅ `RAZORPAY_KEY_ID` is public (safe to use in frontend)
- ❌ `RAZORPAY_KEY_SECRET` is private (NEVER expose to frontend or git)

### 3. Install Dependencies

The Razorpay SDK is not required for this integration as we use direct API calls. All dependencies are already included in your Next.js project.

---

## Architecture

### File Structure

```
apps/web/
├── lib/
│   └── payments/
│       └── razorpay.ts              # Core Razorpay functions
├── app/
│   └── api/
│       ├── consultations/
│       │   ├── create-order/        # POST: Create payment order
│       │   │   └── route.ts
│       │   └── verify-payment/      # POST: Verify payment
│       │       └── route.ts
│       └── webhooks/
│           └── razorpay/            # POST: Webhook handler
│               └── route.ts
└── docs/
    └── RAZORPAY_INTEGRATION.md      # This file
```

### Core Functions (`lib/payments/razorpay.ts`)

| Function | Description |
|----------|-------------|
| `createRazorpayOrder()` | Creates payment order with Razorpay API |
| `verifyPaymentSignature()` | Validates payment callback signature |
| `verifyWebhookSignature()` | Validates webhook signature |
| `fetchPaymentDetails()` | Fetches payment info from Razorpay |
| `initiateRefund()` | Initiates full or partial refund |
| `getRazorpayKeyId()` | Returns public key for frontend |

---

## API Endpoints

### 1. Create Consultation Order

**Endpoint**: `POST /api/consultations/create-order`

**Description**: Creates a consultation booking with Razorpay payment order.

**Authentication**: Required (Supabase session)

**Request Body**:
```json
{
  "astrologerId": "cuid-of-astrologer",
  "scheduledAt": "2025-12-20T15:30:00Z",
  "duration": 30
}
```

**Response**:
```json
{
  "success": true,
  "message": "Consultation order created successfully",
  "consultation": {
    "id": "consultation-cuid",
    "scheduledAt": "2025-12-20T15:30:00Z",
    "duration": 30,
    "amount": 500,
    "astrologer": {
      "id": "astrologer-cuid",
      "name": "Dr. Sharma",
      "imageUrl": "https://...",
      "specialization": ["Vedic", "Kundli"],
      "languages": ["English", "Hindi"]
    }
  },
  "razorpayOrder": {
    "orderId": "order_xxxxxxxxxxxxx",
    "amount": 50000,
    "currency": "INR"
  }
}
```

**Amount Calculation**:
- Fetches astrologer's `hourlyRate` from database
- Formula: `(hourlyRate / 60) * duration` in rupees
- Razorpay expects amount in **paise** (1 rupee = 100 paise)

**Validations**:
- Astrologer must exist and be available
- Scheduled time must be in the future
- Duration must be positive

---

### 2. Verify Payment

**Endpoint**: `POST /api/consultations/verify-payment`

**Description**: Verifies payment signature and updates consultation status.

**Authentication**: Required (Supabase session)

**Request Body**:
```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "generated_hmac_signature"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "consultation": {
    "id": "consultation-cuid",
    "scheduledAt": "2025-12-20T15:30:00Z",
    "duration": 30,
    "amount": 500,
    "paymentStatus": "PAID",
    "status": "SCHEDULED",
    "astrologer": {
      "id": "astrologer-cuid",
      "name": "Dr. Sharma",
      "imageUrl": "https://...",
      "specialization": ["Vedic", "Kundli"],
      "languages": ["English", "Hindi"]
    }
  },
  "paymentDetails": {
    "paymentId": "pay_xxxxxxxxxxxxx",
    "method": "card",
    "email": "user@example.com",
    "contact": "+919876543210"
  }
}
```

**Signature Verification**:
1. Concatenates `order_id|payment_id`
2. Generates HMAC SHA256 using `RAZORPAY_KEY_SECRET`
3. Compares with received signature using timing-safe comparison

**Status Updates**:
- ✅ Valid signature → Consultation `paymentStatus` = `PAID`
- ❌ Invalid signature → Return 400 error
- ❌ Exception → Mark as `FAILED` and return 500 error

---

### 3. Webhook Handler

**Endpoint**: `POST /api/webhooks/razorpay`

**Description**: Receives async payment status updates from Razorpay.

**Authentication**: None (uses webhook signature verification)

**Events Handled**:
- `payment.captured` → Updates to `PAID`
- `payment.failed` → Updates to `FAILED`
- `refund.created` → Updates to `REFUNDED`
- `refund.processed` → Updates to `REFUNDED`

**Security**:
- Verifies `X-Razorpay-Signature` header
- Uses HMAC SHA256 with `RAZORPAY_KEY_SECRET`
- Rejects requests with invalid signatures

**Setup Required**: See [Webhook Configuration](#webhook-configuration)

---

## Frontend Integration

### 1. Install Razorpay Checkout

Add Razorpay checkout script to your layout or page:

```tsx
// app/layout.tsx or app/book-consultation/page.tsx
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

### 2. Create Payment Flow Component

```tsx
'use client'

import { useState } from 'react'
import Script from 'next/script'

interface BookConsultationProps {
  astrologerId: string
}

export default function BookConsultation({ astrologerId }: BookConsultationProps) {
  const [loading, setLoading] = useState(false)

  const handleBookConsultation = async () => {
    setLoading(true)

    try {
      // Step 1: Create order
      const createResponse = await fetch('/api/consultations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astrologerId,
          scheduledAt: '2025-12-20T15:30:00Z', // From date picker
          duration: 30, // From duration selector
        }),
      })

      const { consultation, razorpayOrder } = await createResponse.json()

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Add to .env.local
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.orderId,
        name: 'Digital Astrology',
        description: `Consultation with ${consultation.astrologer.name}`,
        image: '/logo.png',
        handler: async (response: any) => {
          // Step 3: Verify payment
          const verifyResponse = await fetch('/api/consultations/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const result = await verifyResponse.json()

          if (result.success) {
            // Payment successful!
            alert('Consultation booked successfully!')
            window.location.href = `/consultations/${consultation.id}`
          } else {
            alert('Payment verification failed')
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '+919876543210',
        },
        theme: {
          color: '#3399cc',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={handleBookConsultation} disabled={loading}>
        {loading ? 'Processing...' : 'Book Consultation'}
      </button>
    </>
  )
}
```

### 3. Add Public Key to Environment

```bash
# apps/web/.env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## Webhook Configuration

### 1. Setup Webhook URL

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Enter webhook URL:
   - **Development**: Use [ngrok](https://ngrok.com) or similar tunnel
     - Example: `https://abc123.ngrok.io/api/webhooks/razorpay`
   - **Production**: `https://yourdomain.com/api/webhooks/razorpay`
4. Select events:
   - ☑️ `payment.captured`
   - ☑️ `payment.failed`
   - ☑️ `refund.created`
   - ☑️ `refund.processed`
5. Secret: Use your `RAZORPAY_KEY_SECRET`
6. Click **Create Webhook**

### 2. Test Webhook Locally

```bash
# Install ngrok
brew install ngrok

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add it to Razorpay webhook settings
```

### 3. Verify Webhook

Razorpay Dashboard → Webhooks → Your webhook → Test webhook

---

## Testing

### Test Mode

Razorpay provides test cards for payment testing:

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any 3 digits | Any future date | Success |
| 4000 0000 0000 0002 | Any 3 digits | Any future date | Decline |

### Test Flow

1. **Create Order**:
   ```bash
   curl -X POST http://localhost:3000/api/consultations/create-order \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{
       "astrologerId": "clxxx...",
       "scheduledAt": "2025-12-20T15:30:00Z",
       "duration": 30
     }'
   ```

2. **Complete Payment**: Use Razorpay Checkout UI with test card

3. **Verify Payment**: Automatically handled by frontend after payment

4. **Check Database**:
   ```sql
   SELECT id, paymentStatus, status, amount
   FROM consultations
   WHERE paymentId = 'order_xxxxxxxxxxxxx';
   ```

### Integration Tests

Create tests using Jest or Vitest:

```typescript
// __tests__/payments/razorpay.test.ts
import { verifyPaymentSignature } from '@/lib/payments/razorpay'

describe('Razorpay Payment Verification', () => {
  it('should verify valid signature', () => {
    const data = {
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test456',
      razorpay_signature: 'valid_signature_here',
    }

    const isValid = verifyPaymentSignature(data)
    expect(isValid).toBe(true)
  })
})
```

---

## Going Live

### Checklist

- [ ] **Get Live API Keys**
  - Generate live keys from Razorpay Dashboard
  - Update production environment variables

- [ ] **Update Environment Variables**
  ```bash
  RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
  RAZORPAY_KEY_SECRET=your_live_secret_key
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
  ```

- [ ] **Configure Production Webhook**
  - Add production domain to Razorpay webhooks
  - Test webhook delivery

- [ ] **Enable Required Payment Methods**
  - Razorpay Dashboard → Settings → Payment Methods
  - Enable: Cards, UPI, NetBanking, Wallets

- [ ] **Setup Payment Auto-Capture**
  - Dashboard → Settings → Payment Configuration
  - Enable auto-capture (recommended for consultations)

- [ ] **Test Production Flow**
  - Make a real test payment (₹1)
  - Verify database updates
  - Check webhook delivery

- [ ] **Monitor Transactions**
  - Setup Sentry alerts for payment errors
  - Monitor Razorpay Dashboard for failed payments

### Compliance

- **PCI DSS**: Razorpay is PCI DSS compliant. Never store card details.
- **Data Security**: Only store Razorpay payment/order IDs, never sensitive payment data.
- **Terms**: Display Razorpay payment terms to users during checkout.

---

## Troubleshooting

### Issue: "Razorpay credentials not configured"

**Cause**: Environment variables not set

**Fix**:
```bash
# Check if variables are set
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Add to .env.local if missing
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Restart Next.js dev server
```

### Issue: "Payment verification failed. Invalid signature."

**Cause**: Signature mismatch or wrong secret key

**Fix**:
1. Verify you're using the correct `RAZORPAY_KEY_SECRET`
2. Check order_id and payment_id match exactly
3. Ensure no extra spaces or characters in signature

### Issue: "Webhook not receiving events"

**Cause**: Webhook URL not accessible or incorrect secret

**Fix**:
1. Verify webhook URL is publicly accessible
2. Check webhook secret matches `RAZORPAY_KEY_SECRET`
3. Test webhook from Razorpay Dashboard
4. Check server logs for incoming requests

### Issue: "Amount mismatch error"

**Cause**: Frontend passing rupees instead of paise

**Fix**:
- Backend returns amount in **paise** (multiply by 100)
- Frontend should use the amount from API response directly
- Don't convert on frontend

---

## Additional Resources

- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Razorpay Checkout Docs](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Webhook Docs](https://razorpay.com/docs/webhooks/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## Support

For issues related to:
- **Integration code**: Check this documentation or repository issues
- **Razorpay API**: Contact [Razorpay Support](https://razorpay.com/support/)
- **Database/Schema**: Check Prisma schema documentation

---

**Last Updated**: December 2025
**Version**: 1.0.0

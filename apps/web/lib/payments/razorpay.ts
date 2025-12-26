/**
 * Razorpay Payment Gateway Integration
 *
 * Handles payment order creation, verification, and webhook processing for
 * consultations and e-commerce orders.
 *
 * Documentation: https://razorpay.com/docs/api/
 */

import crypto from "crypto";

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  Razorpay credentials not configured. Payment features will not work.");
}

/**
 * Payment order options
 */
export interface CreateOrderOptions {
  amount: number; // Amount in rupees (will be converted to paise)
  currency?: string; // Default: INR
  receipt?: string; // Optional receipt ID for your reference
  notes?: Record<string, string>;
}

/**
 * Razorpay order response
 */
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number; // Amount in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Payment verification data from frontend
 */
export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Create a Razorpay order
 *
 * @param options Order creation options
 * @returns Razorpay order object
 */
export async function createRazorpayOrder(options: CreateOrderOptions): Promise<RazorpayOrder> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  // Convert rupees to paise (Razorpay uses smallest currency unit)
  const amountInPaise = Math.round(options.amount * 100);

  const orderData = {
    amount: amountInPaise,
    currency: options.currency || "INR",
    receipt: options.receipt || `receipt_${Date.now()}`,
    notes: options.notes || {},
  };

  // Create Basic Auth header
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Razorpay order creation failed: ${error.error?.description || response.statusText}`,
    );
  }

  const order: RazorpayOrder = await response.json();
  return order;
}

/**
 * Verify payment signature
 *
 * This verifies that the payment callback from Razorpay is authentic
 * by checking the HMAC signature.
 *
 * @param data Payment verification data from frontend
 * @returns True if signature is valid
 */
export function verifyPaymentSignature(data: PaymentVerificationData): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay secret not configured");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  // Generate expected signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // Compare signatures (timing-safe comparison)
  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));
}

/**
 * Verify webhook signature
 *
 * Razorpay sends webhooks for payment events. This verifies the webhook
 * is authentic by checking the X-Razorpay-Signature header.
 *
 * @param body Raw webhook body (string)
 * @param signature Signature from X-Razorpay-Signature header
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay webhook secret not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 *
 * @param paymentId Razorpay payment ID
 * @returns Payment details
 */
export async function fetchPaymentDetails(paymentId: string): Promise<any> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to fetch payment details: ${error.error?.description || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Initiate refund
 *
 * @param paymentId Razorpay payment ID
 * @param amount Amount to refund in rupees (optional, full refund if not specified)
 * @returns Refund object
 */
export async function initiateRefund(paymentId: string, amount?: number): Promise<any> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

  const refundData: any = {};
  if (amount !== undefined) {
    refundData.amount = Math.round(amount * 100); // Convert to paise
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(refundData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Refund failed: ${error.error?.description || response.statusText}`);
  }

  return response.json();
}

/**
 * Get Razorpay public key for frontend
 *
 * @returns Razorpay key ID (public key)
 */
export function getRazorpayKeyId(): string {
  if (!RAZORPAY_KEY_ID) {
    throw new Error("Razorpay key ID not configured");
  }
  return RAZORPAY_KEY_ID;
}

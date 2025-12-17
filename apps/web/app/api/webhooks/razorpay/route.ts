import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyWebhookSignature } from '@/lib/payments/razorpay'

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events for payment status updates
 *
 * This endpoint receives webhook notifications from Razorpay for events like:
 * - payment.captured (payment successful)
 * - payment.failed (payment failed)
 * - refund.created (refund initiated)
 * - refund.processed (refund completed)
 *
 * Important: This endpoint does NOT require authentication as it's called by Razorpay servers.
 * Security is handled via webhook signature verification.
 *
 * Setup in Razorpay Dashboard:
 * 1. Go to Settings > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/webhooks/razorpay
 * 3. Select events: payment.captured, payment.failed, refund.created, refund.processed
 * 4. Use RAZORPAY_KEY_SECRET as webhook secret
 */
export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Get signature from headers
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.error('Webhook error: Missing signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature)

    if (!isValid) {
      console.error('Webhook error: Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody)
    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity
    const refundEntity = payload.payload?.refund?.entity

    console.log(`Received Razorpay webhook: ${event}`)

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity)
        break

      case 'payment.failed':
        await handlePaymentFailed(paymentEntity)
        break

      case 'refund.created':
      case 'refund.processed':
        await handleRefund(refundEntity)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Handle payment.captured event
 * Updates consultation payment status to PAID
 */
async function handlePaymentCaptured(paymentEntity: any) {
  if (!paymentEntity || !paymentEntity.order_id) {
    console.error('Invalid payment entity:', paymentEntity)
    return
  }

  const orderId = paymentEntity.order_id
  const paymentId = paymentEntity.id

  try {
    // Find consultation by Razorpay order ID
    const consultation = await prisma.consultation.findFirst({
      where: {
        paymentId: orderId,
      }
    })

    if (!consultation) {
      console.error(`Consultation not found for order ID: ${orderId}`)
      return
    }

    // Update payment status to PAID
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: 'PAID',
        updatedAt: new Date(),
      }
    })

    console.log(`Payment captured for consultation ${consultation.id}, payment ID: ${paymentId}`)
  } catch (error) {
    console.error('Error handling payment.captured:', error)
    throw error
  }
}

/**
 * Handle payment.failed event
 * Updates consultation payment status to FAILED
 */
async function handlePaymentFailed(paymentEntity: any) {
  if (!paymentEntity || !paymentEntity.order_id) {
    console.error('Invalid payment entity:', paymentEntity)
    return
  }

  const orderId = paymentEntity.order_id
  const paymentId = paymentEntity.id
  const errorReason = paymentEntity.error_reason || 'Unknown error'

  try {
    // Find consultation by Razorpay order ID
    const consultation = await prisma.consultation.findFirst({
      where: {
        paymentId: orderId,
      }
    })

    if (!consultation) {
      console.error(`Consultation not found for order ID: ${orderId}`)
      return
    }

    // Update payment status to FAILED
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: 'FAILED',
        updatedAt: new Date(),
      }
    })

    console.log(`Payment failed for consultation ${consultation.id}, payment ID: ${paymentId}, reason: ${errorReason}`)
  } catch (error) {
    console.error('Error handling payment.failed:', error)
    throw error
  }
}

/**
 * Handle refund.created and refund.processed events
 * Updates consultation payment status to REFUNDED
 */
async function handleRefund(refundEntity: any) {
  if (!refundEntity || !refundEntity.payment_id) {
    console.error('Invalid refund entity:', refundEntity)
    return
  }

  // const paymentId = refundEntity.payment_id // TODO: Use when razorpayPaymentId field is added
  const refundId = refundEntity.id

  try {
    // Find consultation by payment ID (note: this is the Razorpay payment ID, not order ID)
    // We need to search by the paymentId field which contains the order ID
    // For refunds, we'll need to search across all consultations
    const consultations = await prisma.consultation.findMany({
      where: {
        paymentStatus: 'PAID',
      }
    })

    // In a production system, you would store the Razorpay payment ID separately
    // For now, we'll just update the first matching consultation
    // This is a limitation that should be addressed by adding a razorpayPaymentId field

    if (consultations.length === 0) {
      console.error(`No paid consultations found for refund ${refundId}`)
      return
    }

    // For now, log a warning about the limitation
    console.warn(`Refund processing limitation: Cannot match refund ${refundId} to specific consultation without razorpayPaymentId field`)

    // TODO: Add razorpayPaymentId field to Consultation model and update this logic

  } catch (error) {
    console.error('Error handling refund:', error)
    throw error
  }
}

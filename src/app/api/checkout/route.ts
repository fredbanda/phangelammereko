// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Map package types to Stripe price IDs
const PACKAGE_PRICE_IDS = {
  STANDARD: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED_STANDARD!,
  PRIORITY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED_PRIORITY!,
  URGENT: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED_URGENT!,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      packageType,  // 'STANDARD' | 'PRIORITY' | 'URGENT'
      customerEmail,
      customerName,
      leadId,
      userId,
      consultantId,
      notes,
    } = body;

    // Validate package type
    if (!packageType || !PACKAGE_PRICE_IDS[packageType as keyof typeof PACKAGE_PRICE_IDS]) {
      return NextResponse.json(
        { error: 'Invalid package type' },
        { status: 400 }
      );
    }

    // Get the correct price ID based on selected package
    const priceId = PACKAGE_PRICE_IDS[packageType as keyof typeof PACKAGE_PRICE_IDS];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this package' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      client_reference_id: leadId || userId, // Link to your lead/user
      metadata: {
        packageType,
        customerName,
        customerEmail,
        leadId: leadId || '',
        userId: userId || '',
        consultantId: consultantId || '',
        notes: notes || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancelled`,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Verify checkout session (call this after successful payment)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
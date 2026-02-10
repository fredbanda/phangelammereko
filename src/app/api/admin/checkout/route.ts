// app/api/admin/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/utils/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Admin emails - you can also store this in environment variables or database
const ADMIN_EMAILS = [
  'admin@careerforty.com',
  'phangela@careerforty.com',
  // Add more admin emails here
];

// Check if user is admin
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Check if email is in admin list
    const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());
    
    // Also check database for admin status
    let dbAdminStatus = false;
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { isAdmin: true, role: true }
      });
      
      dbAdminStatus = user?.isAdmin || user?.role === 'ADMIN';
    } catch (dbError) {
      console.error('Database check failed:', dbError);
    }

    return NextResponse.json({
      isAdmin: isAdmin || dbAdminStatus,
      email: userEmail
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}

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
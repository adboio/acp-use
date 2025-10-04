import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(request: NextRequest) {
  console.log("💳 [STRIPE-SETUP] Creating SetupIntent...");

  try {
    const { customer_email, amount, currency } = await request.json();
    console.log("💳 [STRIPE-SETUP] Request data:", {
      customer_email,
      amount,
      currency,
    });

    // Create or get customer
    let customer;
    if (customer_email) {
      const existingCustomers = await stripe.customers.list({
        email: customer_email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log("💳 [STRIPE-SETUP] Using existing customer:", customer.id);
      } else {
        customer = await stripe.customers.create({
          email: customer_email,
        });
        console.log("💳 [STRIPE-SETUP] Created new customer:", customer.id);
      }
    }

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer?.id,
      automatic_payment_methods: {
        enabled: true,
      },
      usage: "off_session",
    });

    console.log("💳 [STRIPE-SETUP] Created SetupIntent:", setupIntent.id);

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
    });
  } catch (error) {
    console.error("❌ [STRIPE-SETUP] Error:", error);
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 },
    );
  }
}

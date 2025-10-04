import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(request: NextRequest) {
  console.log("🔗 [STRIPE-SPT] Creating Shared Payment Token...");

  try {
    const {
      payment_method_id,
      setup_intent_id,
      amount,
      currency,
      merchant_id,
      stripe_account_id,
    } = await request.json();
    console.log("🔗 [STRIPE-SPT] Request data:", {
      payment_method_id,
      setup_intent_id,
      amount,
      currency,
      merchant_id,
      stripe_account_id,
    });

    // Get payment method ID - either directly provided or from setup intent
    let paymentMethodId = payment_method_id;

    if (!paymentMethodId && setup_intent_id) {
      // Fallback: retrieve from setup intent if payment method ID not provided
      const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);
      console.log("🔗 [STRIPE-SPT] Retrieved SetupIntent:", setupIntent.id);

      if (!setupIntent.payment_method) {
        throw new Error("No payment method found on SetupIntent");
      }
      paymentMethodId = setupIntent.payment_method as string;
    }

    if (!paymentMethodId) {
      throw new Error("No payment method ID provided");
    }

    // Get the merchant's connected account if not provided
    let connectedAccountId = stripe_account_id;
    if (!connectedAccountId && merchant_id) {
      const supabase = await createClient();
      const { data: merchant } = await supabase
        .from("merchants")
        .select("stripe_account_id")
        .eq("id", merchant_id)
        .single();

      connectedAccountId = merchant?.stripe_account_id || null;
      console.log(
        "🔗 [STRIPE-SPT] Merchant Stripe account:",
        connectedAccountId,
      );
    }

    if (!connectedAccountId) {
      throw new Error("No connected Stripe account found for merchant");
    }

    // Create PaymentIntent on the platform account and transfer to connected account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/demo`,
      metadata: {
        merchant_id: merchant_id || "unknown",
        source: "acp_checkout",
      },
      // Transfer the payment to the connected account
      transfer_data: {
        destination: connectedAccountId,
      },
      // No platform fee for now
    });

    console.log(
      "🔗 [STRIPE-SPT] Created PaymentIntent:",
      paymentIntent.id,
      "for account:",
      connectedAccountId,
      "status:",
      paymentIntent.status,
    );

    // Return a token-like identifier for the payment intent
    const paymentToken = `pi_${paymentIntent.id}`;

    return NextResponse.json({
      shared_payment_token: paymentToken,
      payment_intent_id: paymentIntent.id,
      stripe_account_id: connectedAccountId,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("❌ [STRIPE-SPT] Error:", error);
    return NextResponse.json(
      { error: "Failed to create shared payment token" },
      { status: 500 },
    );
  }
}

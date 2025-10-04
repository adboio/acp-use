import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(request: NextRequest) {
  console.log("🔗 [STRIPE-SPT] Creating Shared Payment Token...");

  try {
    const { setup_intent_id, amount, currency } = await request.json();
    console.log("🔗 [STRIPE-SPT] Request data:", {
      setup_intent_id,
      amount,
      currency,
    });

    // Retrieve the SetupIntent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);
    console.log("🔗 [STRIPE-SPT] Retrieved SetupIntent:", setupIntent.id);

    if (!setupIntent.payment_method) {
      throw new Error("No payment method found on SetupIntent");
    }

    // Create Shared Payment Token using the correct API endpoint
    const response = await fetch(
      "https://api.stripe.com/v1/shared_payment/issued_tokens",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          payment_method: setupIntent.payment_method as string,
          "usage_limits[currency]": currency,
          "usage_limits[max_amount]": amount.toString(),
          "usage_limits[expires_at]": (
            Math.floor(Date.now() / 1000) +
            24 * 60 * 60
          ).toString(), // 24 hours from now
          "seller_details[network_id]": "acp_demo_network",
          "seller_details[external_id]": "merchant_demo_001",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create shared payment token: ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const sharedPaymentTokenData = await response.json();
    const sharedPaymentToken = sharedPaymentTokenData.id;

    console.log(
      "🔗 [STRIPE-SPT] Created Shared Payment Token:",
      sharedPaymentToken,
    );

    return NextResponse.json({
      shared_payment_token: sharedPaymentToken,
      expires_at: sharedPaymentTokenData.expires_at,
    });
  } catch (error) {
    console.error("❌ [STRIPE-SPT] Error:", error);
    return NextResponse.json(
      { error: "Failed to create shared payment token" },
      { status: 500 },
    );
  }
}

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    // Fetch the user's merchant to get their connected Stripe account ID
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .single();

    console.log("merchant", merchant);

    if (merchantError) {
      console.error("Error fetching merchant:", merchantError);
      return NextResponse.json(
        { error: "Failed to fetch merchant" },
        { status: 500 },
      );
    }

    if (!merchant?.stripe_account_id) {
      return NextResponse.json(
        {
          error: "No connected Stripe account found for this user",
        },
        { status: 400 },
      );
    }

    const accountId = merchant.stripe_account_id;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.headers.get("origin")}/dashboard`,
      return_url: `${req.headers.get("origin")}/dashboard`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account link:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

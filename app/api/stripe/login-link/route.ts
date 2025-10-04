import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    const { data: merchant } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!merchant) {
      return NextResponse.json(
        { error: `Merchant not found for user ${user.id}` },
        { status: 404 },
      );
    }

    if (!merchant.stripe_account_id) {
      return NextResponse.json(
        {
          error:
            "No Stripe connected account found. Please create a connected account first.",
        },
        { status: 400 },
      );
    }

    // Create a login link for the connected account
    const loginLink = await stripe.accounts.createLoginLink(
      merchant.stripe_account_id,
    );

    return NextResponse.json({
      url: loginLink.url,
      created: loginLink.created,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create a login link:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

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

    if (merchant?.stripe_account_id) {
      console.log(
        `Stripe account already exists for user ${user.id}: ${merchant.stripe_account_id}`,
      );
      return NextResponse.json({ account: merchant.stripe_account_id });
    }

    const account = await stripe.accounts.create({
      email: merchant.email || undefined,
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
      },
    });

    const { error: updateError } = await supabase
      .from("merchants")
      .update({ stripe_account_id: account.id })
      .eq("id", merchant.id);
    if (updateError) {
      console.error(
        "An error occurred when updating the merchant:",
        updateError,
      );
      return NextResponse.json(
        { error: "Failed to update merchant" },
        { status: 500 },
      );
    }

    return NextResponse.json({ account: account.id });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

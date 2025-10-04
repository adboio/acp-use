import { getConnectedAccountStatus } from "@/lib/stripe-account";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .single();

    if (merchantError) {
      console.error("Error fetching merchant:", merchantError);
      return NextResponse.json(
        { error: "Failed to fetch merchant" },
        { status: 500 },
      );
    }

    if (!merchant?.stripe_account_id) {
      return NextResponse.json({ connected: false });
    }

    const status = await getConnectedAccountStatus(merchant.stripe_account_id);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error retrieving connected account status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

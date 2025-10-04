import { NextRequest, NextResponse } from "next/server";
import { oauthManager } from "@/lib/oauth/manager";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchant_id");

    if (!merchantId) {
      return NextResponse.json(
        { error: "merchant_id is required" },
        { status: 400 },
      );
    }

    const connections = await oauthManager.getConnections(merchantId);
    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Get connections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connection_id");

    if (!connectionId) {
      return NextResponse.json(
        { error: "connection_id is required" },
        { status: 400 },
      );
    }

    const success = await oauthManager.revokeConnection(connectionId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to revoke connection" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke connection error:", error);
    return NextResponse.json(
      { error: "Failed to revoke connection" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { oauthManager } from "@/lib/oauth/manager";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await params;

    const connection = await oauthManager.refreshConnection(connectionId);
    return NextResponse.json({ connection });
  } catch (error) {
    console.error("Refresh connection error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh connection",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { oauthManager } from "@/lib/oauth/manager";
import { OAuthProviderName } from "@/lib/oauth/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);

    const merchantId = searchParams.get("merchant_id");
    const returnUrl = searchParams.get("return_url");

    if (!merchantId) {
      return NextResponse.json(
        { error: "merchant_id is required" },
        { status: 400 },
      );
    }

    if (
      !oauthManager
        .getAvailableProviders()
        .includes(provider as OAuthProviderName)
    ) {
      return NextResponse.json(
        { error: `Provider '${provider}' is not supported` },
        { status: 400 },
      );
    }

    const authUrl = await oauthManager.initiateOAuth(
      provider as OAuthProviderName,
      merchantId,
      returnUrl || undefined,
    );

    console.log("🤖 [INITIATE OAUTH] Redirecting to:", authUrl);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 },
    );
  }
}

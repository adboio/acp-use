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

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(errorDescription || error)}`,
          request.url,
        ),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/auth/error?error=Missing authorization code or state",
          request.url,
        ),
      );
    }

    if (
      !oauthManager
        .getAvailableProviders()
        .includes(provider as OAuthProviderName)
    ) {
      return NextResponse.redirect(
        new URL("/auth/error?error=Unsupported provider", request.url),
      );
    }

    const connection = await oauthManager.handleCallback(
      provider as OAuthProviderName,
      code,
      state,
    );

    // Redirect to success page or return URL
    const successUrl = new URL(
      "/dashboard/connections?success=true",
      request.url,
    );
    successUrl.searchParams.set("provider", provider);
    successUrl.searchParams.set("connection_id", connection.id);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(
          error instanceof Error ? error.message : "OAuth callback failed",
        )}`,
        request.url,
      ),
    );
  }
}

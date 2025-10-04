import { BaseOAuthProvider } from "../base-provider";
import {
  OAuthConfig,
  OAuthTokens,
  OAuthUserInfo,
  OAuthProviderCapabilities,
} from "../types";

export class WixOAuthProvider extends BaseOAuthProvider {
  readonly name = "wix";
  readonly capabilities: OAuthProviderCapabilities = {
    supportsRefresh: true,
    supportsRevocation: true,
    tokenExpiryDays: 1, // Wix access tokens expire in 24 hours
    refreshTokenExpiryDays: 365, // Wix refresh tokens are long-lived
    maxTokensPerUser: 10, // Wix allows multiple access tokens per app
  };

  constructor(config: OAuthConfig) {
    super(config);
  }

  generateAuthUrl(
    state: string,
    additionalParams: Record<string, string> = {},
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      state,
      ...additionalParams,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    state: string,
  ): Promise<OAuthTokens> {
    console.log("🤖 [WIX] Exchanging code for tokens:", code, state);

    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();

    console.log("🤖 [WIX] Token response data:", JSON.stringify(data, null, 2));

    if (data.error) {
      throw new Error(
        `Wix OAuth error: ${data.error_description || data.error}`,
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: this.calculateExpiryDate(data.expires_in),
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    console.log("🤖 [WIX] Refreshing access token:", refreshToken);

    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `Wix refresh error: ${data.error_description || data.error}`,
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Wix may return new refresh token
      expiresAt: this.calculateExpiryDate(data.expires_in),
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      // Wix doesn't have a standard OAuth revoke endpoint
      // We'll attempt to make an API call that should fail if token is invalid
      await this.makeRequest("https://www.wixapis.com/v1/apps/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If we get here, the token is still valid, so we can't revoke it
      return false;
    } catch (error) {
      console.log("🤖 [WIX] Error revoking token:", error);
      // If the API call fails, the token might already be invalid
      return true;
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // Get app instance information from Wix
    const response = await this.makeRequest(
      "https://www.wixapis.com/v1/apps/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`Wix API error: ${data.error_description || data.error}`);
    }

    const app = data.app;
    if (!app) {
      throw new Error("No app information found");
    }

    return {
      id: app.instanceId || app.appId,
      email: app.ownerEmail,
      name: app.appName || app.displayName,
      platform: "wix",
      rawData: app,
    };
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      console.log("🤖 [WIX] Error validating token:", error);
      return false;
    }
  }
}

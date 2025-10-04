import { BaseOAuthProvider } from "../base-provider";
import {
  OAuthConfig,
  OAuthTokens,
  OAuthUserInfo,
  OAuthProviderCapabilities,
} from "../types";

export class SquareOAuthProvider extends BaseOAuthProvider {
  readonly name = "square";
  readonly capabilities: OAuthProviderCapabilities = {
    supportsRefresh: true,
    supportsRevocation: true,
    tokenExpiryDays: 30,
    refreshTokenExpiryDays: 365, // Square refresh tokens don't expire
    maxTokensPerUser: 10, // Square allows multiple access tokens per refresh token
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
      scope: this.config.scopes.join(" "),
      state,
      session: "false", // Don't require existing Square session
      ...additionalParams,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    state: string,
  ): Promise<OAuthTokens> {
    console.log("🤖 [SQUARE] Exchanging code for tokens:", code, state);
    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2025-01-23",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Square OAuth error: ${data.errors[0].detail}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: this.calculateExpiryDate(data.expires_at),
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2025-01-23",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Square refresh error: ${data.errors[0].detail}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Square may return new refresh token
      expiresAt: this.calculateExpiryDate(data.expires_at),
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      const revokeUrl =
        this.config.environment === "production"
          ? "https://connect.squareup.com/oauth2/revoke"
          : "https://connect.squareupsandbox.com/oauth2/revoke";

      await this.makeRequest(revokeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": "2025-01-23",
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          access_token: token,
        }),
      });

      return true;
    } catch (error) {
      console.error("Failed to revoke Square token:", error);
      return false;
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // Square doesn't have a direct user info endpoint, but we can get merchant info
    const response = await this.makeRequest(
      `${this.config.environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com"}/v2/merchants`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Square-Version": "2025-01-23",
        },
      },
    );

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Square API error: ${data.errors[0].detail}`);
    }

    const merchant = data.merchant?.[0];
    if (!merchant) {
      throw new Error("No merchant information found");
    }

    return {
      id: merchant.id,
      email: merchant.business_name, // Square doesn't provide email in merchant info
      name: merchant.business_name,
      platform: "square",
      rawData: merchant,
    };
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      console.log("🤖 [SQUARE] Error validating token:", error);
      return false;
    }
  }
}

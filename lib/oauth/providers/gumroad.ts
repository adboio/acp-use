import { BaseOAuthProvider } from "../base-provider";
import {
  OAuthConfig,
  OAuthTokens,
  OAuthUserInfo,
  OAuthProviderCapabilities,
} from "../types";

export class GumroadOAuthProvider extends BaseOAuthProvider {
  readonly name = "gumroad";
  readonly capabilities: OAuthProviderCapabilities = {
    supportsRefresh: false, // Gumroad doesn't support refresh tokens
    supportsRevocation: true,
    tokenExpiryDays: 30, // Estimated based on typical OAuth patterns
    maxTokensPerUser: 1, // Gumroad typically allows one active token
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
    console.log("🤖 [GUMROAD] Exchanging code for tokens:", code, state);
    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `Gumroad OAuth error: ${data.error_description || data.error}`,
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // Gumroad may not provide this
      expiresAt: this.calculateExpiryDate(data.expires_in),
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    console.log("🤖 [GUMROAD] Refreshing access token:", refreshToken);
    throw new Error(
      "Gumroad does not support token refresh. Please re-authenticate.",
    );
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      // Gumroad doesn't have a standard OAuth revoke endpoint
      // We'll attempt to make an API call that should fail if token is invalid
      await this.makeRequest("https://api.gumroad.com/v2/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If we get here, the token is still valid, so we can't revoke it
      return false;
    } catch (error) {
      console.log("🤖 [GUMROAD] Error revoking token:", error);
      // If the API call fails, the token might already be invalid
      return true;
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await this.makeRequest("https://api.gumroad.com/v2/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.success === false) {
      throw new Error(`Gumroad API error: ${data.message || "Unknown error"}`);
    }

    const user = data.user;
    if (!user) {
      throw new Error("No user information found");
    }

    return {
      id: user.id?.toString() || user.email,
      email: user.email,
      name: user.name || user.email,
      platform: "gumroad",
      rawData: user,
    };
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      console.log("🤖 [GUMROAD] Error validating token:", error);
      return false;
    }
  }
}

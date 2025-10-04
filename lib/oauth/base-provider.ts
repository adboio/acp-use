import {
  OAuthProvider,
  OAuthConfig,
  OAuthTokens,
  OAuthUserInfo,
  OAuthProviderCapabilities,
} from "./types";

export abstract class BaseOAuthProvider implements OAuthProvider {
  protected config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  abstract readonly name: string;
  abstract readonly capabilities: OAuthProviderCapabilities;

  // Abstract methods that must be implemented by each provider
  abstract generateAuthUrl(
    state: string,
    additionalParams?: Record<string, string>,
  ): string;
  abstract exchangeCodeForTokens(
    code: string,
    state: string,
  ): Promise<OAuthTokens>;
  abstract refreshAccessToken(refreshToken: string): Promise<OAuthTokens>;
  abstract revokeToken(token: string): Promise<boolean>;
  abstract getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
  abstract validateToken(accessToken: string): Promise<boolean>;

  // Common utility methods
  protected generateState(
    merchantId: string,
    additionalData?: Record<string, any>,
  ): string {
    const stateData = {
      merchantId,
      timestamp: Date.now(),
      ...additionalData,
    };
    return Buffer.from(JSON.stringify(stateData)).toString("base64url");
  }

  protected parseState(state: string): Record<string, any> {
    try {
      return JSON.parse(Buffer.from(state, "base64url").toString());
    } catch (error) {
      throw new Error("Invalid state parameter: " + error);
    }
  }

  protected async makeRequest(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ACP-OAuth-Client/1.0",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  }

  protected isTokenExpired(expiresAt?: Date): boolean {
    if (!expiresAt) return false;
    return new Date() >= expiresAt;
  }

  protected calculateExpiryDate(expiresInSeconds?: number): Date | undefined {
    if (!expiresInSeconds) return undefined;
    return new Date(Date.now() + expiresInSeconds * 1000);
  }
}

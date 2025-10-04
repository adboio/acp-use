import { createClient } from "@/lib/supabase/server";
import {
  OAuthProvider,
  OAuthProviderName,
  OAuthConnection,
  OAuthState,
  OAuthError,
} from "./types";
import { SquareOAuthProvider } from "./providers/square";
import { GumroadOAuthProvider } from "./providers/gumroad";
import { WixOAuthProvider } from "./providers/wix";

export class OAuthManager {
  private providers: Map<OAuthProviderName, OAuthProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Square Provider
    if (
      process.env.NEXT_PUBLIC_SQUARE_APP_ID &&
      process.env.SQUARE_APPLICATION_SECRET
    ) {
      const squareConfig = {
        clientId: process.env.NEXT_PUBLIC_SQUARE_APP_ID,
        clientSecret: process.env.SQUARE_APPLICATION_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/callback/square`,
        scopes: [
          "MERCHANT_PROFILE_READ",
          "ITEMS_READ",
          "ORDERS_READ",
          "ORDERS_WRITE",
          "PAYMENTS_READ",
          "PAYMENTS_WRITE",
        ],
        authorizationUrl:
          "https://connect.squareupsandbox.com/oauth2/authorize",
        // process.env.NODE_ENV === "production"
        //   ? "https://connect.squareup.com/oauth2/authorize"
        //   : "https://connect.squareupsandbox.com/oauth2/authorize",
        tokenUrl: "https://connect.squareupsandbox.com/oauth2/token",
        // process.env.NODE_ENV === "production"
        //   ? "https://connect.squareup.com/oauth2/token"
        //   : "https://connect.squareupsandbox.com/oauth2/token",
        environment: "sandbox" as const,
        // (process.env.NODE_ENV === "production"
        //   ? "production"
        //   : "sandbox") as "production" | "sandbox",
      };
      this.providers.set("square", new SquareOAuthProvider(squareConfig));
    }

    // Gumroad Provider
    if (
      process.env.NEXT_PUBLIC_GUMROAD_APPLICATION_ID &&
      process.env.GUMROAD_APPLICATION_SECRET
    ) {
      const gumroadConfig = {
        clientId: process.env.NEXT_PUBLIC_GUMROAD_APPLICATION_ID,
        clientSecret: process.env.GUMROAD_APPLICATION_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/callback/gumroad`,
        scopes: ["view_profile", "view_sales"],
        authorizationUrl: "https://gumroad.com/oauth/authorize",
        tokenUrl: "https://gumroad.com/oauth/token",
        environment: "production" as const,
      };
      this.providers.set("gumroad", new GumroadOAuthProvider(gumroadConfig));
    }

    // Wix Provider
    if (process.env.NEXT_PUBLIC_WIX_APP_ID && process.env.WIX_APP_SECRET) {
      const wixConfig = {
        clientId: process.env.NEXT_PUBLIC_WIX_APP_ID,
        clientSecret: process.env.WIX_APP_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/callback/wix`,
        scopes: [
          "SITE_READ",
          "SITE_WRITE",
          "STORES_READ",
          "STORES_WRITE",
          "ORDERS_READ",
          "ORDERS_WRITE",
        ],
        authorizationUrl: "https://www.wix.com/oauth/authorize",
        tokenUrl: "https://www.wixapis.com/oauth/access",
        environment: "production" as const,
      };
      this.providers.set("wix", new WixOAuthProvider(wixConfig));
    }
  }

  getProvider(name: OAuthProviderName): OAuthProvider | null {
    return this.providers.get(name) || null;
  }

  getAvailableProviders(): OAuthProviderName[] {
    return Array.from(this.providers.keys());
  }

  async initiateOAuth(
    providerName: OAuthProviderName,
    merchantId: string,
    returnUrl?: string,
  ): Promise<string> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`OAuth provider '${providerName}' is not configured`);
    }

    const state = this.encodeState({
      merchantId,
      provider: providerName,
      returnUrl,
    });

    return provider.generateAuthUrl(state);
  }

  async handleCallback(
    providerName: OAuthProviderName,
    code: string,
    state: string,
  ): Promise<OAuthConnection> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`OAuth provider '${providerName}' is not configured`);
    }

    const stateData = this.decodeState(state);
    if (stateData.provider !== providerName) {
      throw new Error("Invalid state parameter");
    }

    try {
      console.log(
        "🤖 [OAUTH MANAGER] Starting OAuth flow for provider:",
        providerName,
      );

      // Exchange code for tokens
      console.log("🤖 [OAUTH MANAGER] Exchanging code for tokens...");
      const tokens = await provider.exchangeCodeForTokens(code, state);
      console.log("🤖 [OAUTH MANAGER] Successfully exchanged code for tokens");

      // Get user info
      console.log("🤖 [OAUTH MANAGER] Getting user info...");
      const userInfo = await provider.getUserInfo(tokens.accessToken);
      console.log("🤖 [OAUTH MANAGER] Successfully got user info");

      // Store connection in database
      console.log("🤖 [OAUTH MANAGER] Storing connection in database...");
      const connection = await this.storeConnection({
        merchantId: stateData.merchantId,
        provider: providerName,
        tokens,
        userInfo,
        capabilities: provider.capabilities,
      });
      console.log("🤖 [OAUTH MANAGER] Successfully stored connection");

      return connection;
    } catch (error) {
      throw new OAuthError(
        "OAUTH_CALLBACK_FAILED",
        `Failed to complete OAuth flow: ${error instanceof Error ? error.message : "Unknown error"}`,
        providerName,
        { originalError: error },
      );
    }
  }

  async refreshConnection(connectionId: string): Promise<OAuthConnection> {
    const supabase = await createClient();

    const { data: connection, error } = await supabase
      .from("merchant_connectors")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (error || !connection) {
      throw new Error("Connection not found");
    }

    const provider = this.getProvider(connection.provider as OAuthProviderName);
    if (!provider) {
      throw new Error(`Provider ${connection.provider} not available`);
    }

    if (
      !provider.capabilities.supportsRefresh ||
      !connection.credentials?.refreshToken
    ) {
      throw new Error("Token refresh not supported for this provider");
    }

    try {
      const newTokens = await provider.refreshAccessToken(
        connection.credentials.refreshToken,
      );

      const updatedConnection = await this.updateConnection(connectionId, {
        tokens: newTokens,
        lastUsedAt: new Date(),
      });

      return updatedConnection;
    } catch (error) {
      throw new Error(
        `Failed to refresh token: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async revokeConnection(connectionId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data: connection, error } = await supabase
      .from("merchant_connectors")
      .select("*")
      .eq("id", connectionId)
      .single();

    if (error || !connection) {
      return false;
    }

    const provider = this.getProvider(connection.provider as OAuthProviderName);
    if (!provider) {
      return false;
    }

    try {
      if (
        provider.capabilities.supportsRevocation &&
        connection.credentials?.accessToken
      ) {
        await provider.revokeToken(connection.credentials.accessToken);
      }

      // Update status in database
      await supabase
        .from("merchant_connectors")
        .update({
          status: "revoked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectionId);

      return true;
    } catch (error) {
      console.error("Failed to revoke connection:", error);
      return false;
    }
  }

  async getConnections(merchantId: string): Promise<OAuthConnection[]> {
    const supabase = await createClient();

    const { data: connections, error } = await supabase
      .from("merchant_connectors")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("status", "connected");

    if (error) {
      console.error("Failed to fetch connections:", error);
      throw new Error("Failed to fetch connections");
    }

    return connections.map(this.mapDatabaseRowToConnection);
  }

  private async storeConnection(data: {
    merchantId: string;
    provider: OAuthProviderName;
    tokens: any;
    userInfo: any;
    capabilities: any;
  }): Promise<OAuthConnection> {
    const supabase = await createClient();

    console.log(
      "🤖 [OAUTH MANAGER] Storing connection with tokens:",
      JSON.stringify(data.tokens, null, 2),
    );

    // Safely handle expiresAt
    let expiresAtString: string | undefined;
    if (data.tokens.expiresAt) {
      try {
        expiresAtString = data.tokens.expiresAt.toISOString();
        console.log(
          "🤖 [OAUTH MANAGER] Converted expiresAt to ISO string:",
          expiresAtString,
        );
      } catch (error) {
        console.error(
          "🤖 [OAUTH MANAGER] Error converting expiresAt to ISO string:",
          data.tokens.expiresAt,
          error,
        );
        expiresAtString = undefined;
      }
    }

    const { data: connection, error } = await supabase
      .from("merchant_connectors")
      .insert({
        merchant_id: data.merchantId,
        provider: data.provider,
        status: "connected",
        credentials: {
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          expiresAt: expiresAtString,
          scope: data.tokens.scope,
          tokenType: data.tokens.tokenType,
        },
        capabilities: data.capabilities,
        // Store user info in a separate field or related table if needed
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store connection: ${error.message}`);
    }

    return this.mapDatabaseRowToConnection(connection);
  }

  private async updateConnection(
    connectionId: string,
    updates: Partial<OAuthConnection>,
  ): Promise<OAuthConnection> {
    const supabase = await createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.tokens) {
      updateData.credentials = {
        accessToken: updates.tokens.accessToken,
        refreshToken: updates.tokens.refreshToken,
        expiresAt: updates.tokens.expiresAt?.toISOString(),
        scope: updates.tokens.scope,
        tokenType: updates.tokens.tokenType,
      };
    }

    if (updates.lastUsedAt) {
      updateData.last_used_at = updates.lastUsedAt.toISOString();
    }

    const { data: connection, error } = await supabase
      .from("merchant_connectors")
      .update(updateData)
      .eq("id", connectionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update connection: ${error.message}`);
    }

    return this.mapDatabaseRowToConnection(connection);
  }

  private mapDatabaseRowToConnection(row: any): OAuthConnection {
    return {
      id: row.id.toString(),
      merchantId: row.merchant_id.toString(),
      provider: row.provider,
      status: row.status,
      tokens: {
        accessToken: row.credentials?.accessToken,
        refreshToken: row.credentials?.refreshToken,
        expiresAt: row.credentials?.expiresAt
          ? new Date(row.credentials.expiresAt)
          : undefined,
        scope: row.credentials?.scope,
        tokenType: row.credentials?.tokenType,
      },
      userInfo: row.user_info || {},
      capabilities: row.capabilities || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
    };
  }

  private encodeState(state: OAuthState): string {
    return Buffer.from(JSON.stringify(state)).toString("base64url");
  }

  private decodeState(state: string): OAuthState {
    try {
      return JSON.parse(Buffer.from(state, "base64url").toString());
    } catch (error) {
      throw new Error("Invalid state parameter: " + error);
    }
  }
}

// Singleton instance
export const oauthManager = new OAuthManager();

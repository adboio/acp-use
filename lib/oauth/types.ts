export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  environment: "sandbox" | "production";
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType?: string;
}

export interface OAuthUserInfo {
  id: string;
  email?: string;
  name?: string;
  platform: string;
  rawData: Record<string, any>;
}

export interface OAuthProviderCapabilities {
  supportsRefresh: boolean;
  supportsRevocation: boolean;
  tokenExpiryDays?: number;
  refreshTokenExpiryDays?: number;
  maxTokensPerUser?: number;
}

export interface OAuthProvider {
  readonly name: string;
  readonly capabilities: OAuthProviderCapabilities;

  // OAuth Flow Methods
  generateAuthUrl(
    state: string,
    additionalParams?: Record<string, string>,
  ): string;
  exchangeCodeForTokens(code: string, state: string): Promise<OAuthTokens>;
  refreshAccessToken(refreshToken: string): Promise<OAuthTokens>;
  revokeToken(token: string): Promise<boolean>;

  // User Info Methods
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;

  // Validation Methods
  validateToken(accessToken: string): Promise<boolean>;

  // Product Methods (optional - only for providers that support product fetching)
  getProducts?(accessToken: string): Promise<any[]>;

  // Order Methods (optional - only for providers that support order creation)
  createOrder?(accessToken: string, orderData: any): Promise<any>;
  updateOrderStatus?(accessToken: string, orderId: string, version: number, status: string): Promise<any>;
}

export interface OAuthConnection {
  id: string;
  merchantId: string;
  provider: string;
  status: "connected" | "revoked" | "expired";
  tokens: OAuthTokens;
  userInfo: OAuthUserInfo;
  capabilities: OAuthProviderCapabilities;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export class OAuthError extends Error {
  code: string;
  provider: string;
  details?: Record<string, any>;

  constructor(
    code: string,
    message: string,
    provider: string,
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = "OAuthError";
    this.code = code;
    this.provider = provider;
    this.details = details;
  }
}

export type OAuthProviderName = "square" | "gumroad" | "stripe" | "mindbody" | "wix";

export interface OAuthState {
  merchantId: string;
  provider: OAuthProviderName;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

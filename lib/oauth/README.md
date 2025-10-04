# OAuth Integration Architecture

This directory contains a flexible OAuth integration system that supports multiple platforms including Square, Gumroad, and can be easily extended to support additional providers.

## Architecture Overview

The OAuth system uses the **Adapter Pattern** to provide a consistent interface for different OAuth providers while allowing each provider to implement its specific authentication flow.

### Key Components

1. **Base Interfaces** (`types.ts`) - Common contracts for all OAuth providers
2. **Base Provider** (`base-provider.ts`) - Abstract base class with common functionality
3. **Provider Adapters** (`providers/`) - Platform-specific implementations
4. **OAuth Manager** (`manager.ts`) - Centralized service for managing OAuth flows
5. **API Routes** (`app/api/oauth/`) - RESTful endpoints for OAuth operations
6. **UI Components** (`components/oauth/`) - React components for OAuth management

## Supported Providers

### Square

- **OAuth Flow**: Authorization Code Flow
- **Token Refresh**: Supported (refresh tokens don't expire)
- **Token Revocation**: Supported
- **Scopes**: MERCHANT_PROFILE_READ, ORDERS_READ, ORDERS_WRITE, PAYMENTS_READ, PAYMENTS_WRITE

### Gumroad

- **OAuth Flow**: Authorization Code Flow
- **Token Refresh**: Not supported (requires re-authentication)
- **Token Revocation**: Limited support
- **Scopes**: view_profile, view_sales

## Usage

### 1. Environment Setup

Add the following environment variables to your `.env.local`:

```bash
# Square OAuth
SQUARE_APPLICATION_ID=your_square_application_id
SQUARE_APPLICATION_SECRET=your_square_application_secret

# Gumroad OAuth
GUMROAD_CLIENT_ID=your_gumroad_client_id
GUMROAD_CLIENT_SECRET=your_gumroad_client_secret

# Base URL for OAuth redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Database Schema

The system uses the existing `merchant_connectors` table with the following structure:

```sql
-- Add these columns to merchant_connectors table if they don't exist
ALTER TABLE merchant_connectors
ADD COLUMN user_info JSONB,
ADD COLUMN last_used_at TIMESTAMP;

-- Update the enum to include new providers
ALTER TYPE merchant_connector ADD VALUE 'gumroad';
```

### 3. API Usage

#### Initiate OAuth Flow

```typescript
// Redirect user to OAuth provider
const authUrl = await fetch(
  `/api/oauth/initiate/square?merchant_id=${merchantId}`,
);
const { authUrl } = await authUrl.json();
window.location.href = authUrl;
```

#### Handle OAuth Callback

The callback is automatically handled by the API route at `/api/oauth/callback/[provider]`.

#### Get Connections

```typescript
const response = await fetch(
  `/api/oauth/connections?merchant_id=${merchantId}`,
);
const { connections } = await response.json();
```

#### Refresh Token

```typescript
const response = await fetch(`/api/oauth/refresh/${connectionId}`, {
  method: "POST",
});
const { connection } = await response.json();
```

#### Revoke Connection

```typescript
const response = await fetch(
  `/api/oauth/connections?connection_id=${connectionId}`,
  {
    method: "DELETE",
  },
);
```

### 4. UI Components

Use the `ConnectionManager` component to provide a complete OAuth management interface:

```tsx
import { ConnectionManager } from "@/components/oauth/connection-manager";

function MyPage() {
  return (
    <ConnectionManager
      merchantId="your_merchant_id"
      onConnectionUpdate={() => console.log("Connections updated")}
    />
  );
}
```

## Adding New Providers

To add a new OAuth provider:

1. **Create Provider Class**: Extend `BaseOAuthProvider` in `providers/your-provider.ts`
2. **Implement Required Methods**:
   - `generateAuthUrl()`
   - `exchangeCodeForTokens()`
   - `refreshAccessToken()` (if supported)
   - `revokeToken()`
   - `getUserInfo()`
   - `validateToken()`
3. **Update Types**: Add provider name to `OAuthProviderName` type
4. **Register Provider**: Add initialization in `OAuthManager.initializeProviders()`
5. **Update Database**: Add provider to `merchant_connector` enum

### Example Provider Implementation

```typescript
export class YourProviderOAuthProvider extends BaseOAuthProvider {
  readonly name = "your_provider";
  readonly capabilities: OAuthProviderCapabilities = {
    supportsRefresh: true,
    supportsRevocation: true,
    tokenExpiryDays: 30,
  };

  generateAuthUrl(
    state: string,
    additionalParams?: Record<string, string>,
  ): string {
    // Implement authorization URL generation
  }

  async exchangeCodeForTokens(
    code: string,
    state: string,
  ): Promise<OAuthTokens> {
    // Implement token exchange
  }

  // ... implement other required methods
}
```

## Security Considerations

1. **State Parameter**: Always use cryptographically secure state parameters
2. **Token Storage**: Tokens are stored encrypted in the database
3. **HTTPS**: OAuth redirects require HTTPS in production
4. **Token Expiry**: Monitor and refresh tokens before expiration
5. **Scope Validation**: Validate requested scopes against allowed scopes

## Error Handling

The system provides comprehensive error handling with specific error types:

```typescript
try {
  const connection = await oauthManager.handleCallback(provider, code, state);
} catch (error) {
  if (error instanceof OAuthError) {
    console.error(`OAuth Error [${error.provider}]: ${error.message}`);
    console.error("Error Code:", error.code);
    console.error("Details:", error.details);
  }
}
```

## Testing

### Sandbox Testing

- **Square**: Use Square Sandbox environment for testing
- **Gumroad**: Use Gumroad's test environment if available

### Test OAuth Flow

1. Start your development server
2. Navigate to `/connections`
3. Click "Connect" for a provider
4. Complete the OAuth flow
5. Verify the connection appears in the UI

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**: Ensure redirect URIs match exactly in provider settings
2. **State Mismatch**: Check that state parameter is properly encoded/decoded
3. **Token Expiry**: Implement automatic token refresh for supported providers
4. **Scope Issues**: Verify requested scopes are approved in provider settings

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and check console logs for detailed OAuth flow information.

# Wix OAuth Provider Setup

This document explains how to set up and use the Wix OAuth provider in your application.

## Prerequisites

1. A Wix Developer account
2. A Wix app created in the Wix Developer Center
3. Environment variables configured

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Wix OAuth Configuration
NEXT_PUBLIC_WIX_APP_ID=your_wix_app_id
WIX_APP_SECRET=your_wix_app_secret
```

## Wix App Configuration

1. Go to the [Wix Developer Center](https://dev.wix.com/)
2. Create a new app or select an existing one
3. In the app settings, configure the OAuth settings:
   - **Redirect URI**: `https://yourdomain.com/api/oauth/callback/wix`
   - **Scopes**: Select the required scopes:
     - `SITE_READ` - Read site information
     - `SITE_WRITE` - Write site information
     - `STORES_READ` - Read store information
     - `STORES_WRITE` - Write store information
     - `ORDERS_READ` - Read orders
     - `ORDERS_WRITE` - Write orders

## Usage

The Wix OAuth provider is automatically registered when the required environment variables are present. Users can connect their Wix accounts through the connections page at `/dashboard/connections`.

### OAuth Flow

1. User clicks "Connect" for Wix on the connections page
2. User is redirected to Wix authorization page
3. User grants permissions to your app
4. Wix redirects back to `/api/oauth/callback/wix`
5. The callback handler exchanges the authorization code for access tokens
6. User information is retrieved and stored
7. User is redirected back to the connections page

### API Endpoints

- **Initiate OAuth**: `GET /api/oauth/initiate/wix?merchant_id={merchant_id}`
- **OAuth Callback**: `GET /api/oauth/callback/wix`
- **Get Connections**: `GET /api/oauth/connections?merchant_id={merchant_id}`
- **Refresh Token**: `POST /api/oauth/refresh/{connection_id}`
- **Revoke Connection**: `DELETE /api/oauth/connections?connection_id={connection_id}`

## Token Management

- **Access Tokens**: Expire in 24 hours
- **Refresh Tokens**: Long-lived (365 days)
- **Auto-refresh**: Supported for expired tokens
- **Revocation**: Supported for disconnecting accounts

## Error Handling

The provider includes comprehensive error handling for:

- Invalid authorization codes
- Expired tokens
- Network errors
- API rate limits
- Invalid credentials

## Testing

To test the Wix OAuth integration:

1. Set up the environment variables
2. Start your development server
3. Navigate to `/dashboard/connections`
4. Click "Connect" for Wix
5. Complete the OAuth flow
6. Verify the connection appears in the connections list

## Troubleshooting

### Common Issues

1. **"Provider not configured"**: Check that environment variables are set correctly
2. **"Invalid redirect URI"**: Ensure the redirect URI in Wix matches your callback URL
3. **"Invalid scope"**: Verify the requested scopes are enabled in your Wix app
4. **Token refresh fails**: Check that the refresh token is still valid

### Debug Logging

The provider includes detailed logging. Check your console for messages prefixed with `🤖 [WIX]` to debug issues.

## Security Considerations

- Store client secrets securely
- Use HTTPS in production
- Implement proper state validation
- Regularly rotate credentials
- Monitor for suspicious activity

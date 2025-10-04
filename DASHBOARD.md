# Dashboard Overview

The ACP-Use dashboard provides users with a comprehensive view of their integrations and business metrics.

## Features

### 1. Analytics Overview

- **Total Revenue**: Displays current revenue with month-over-month change
- **Total Orders**: Shows order count with trend indicators
- **Active Connections**: Number of connected platforms
- **Monthly Transactions**: Transaction volume with growth metrics

### 2. Connected Services Management

- View all connected OAuth providers (Square, Gumroad, Wix)
- See connection status and health
- Refresh expired tokens
- Disconnect accounts
- Connect new services

### 3. Stripe Payment Processing

- Onboard with Stripe for payment processing
- View account status and processing fees
- Manage payment settings

## Navigation

The dashboard includes:

- **Header**: User profile, notifications, settings
- **Sidebar Navigation**: Dashboard, Connections, Demo
- **Responsive Design**: Works on desktop and mobile

## Authentication

- Protected route requiring user authentication
- Redirects to login if not authenticated
- Uses Supabase for user management

## File Structure

```
app/dashboard/
├── page.tsx                 # Main dashboard page
└── layout.tsx              # Dashboard layout wrapper

components/dashboard/
├── dashboard-header.tsx     # Navigation header
├── connections-section.tsx  # OAuth connections management
├── stripe-onboarding-section.tsx # Stripe setup
└── analytics-section.tsx    # Mock analytics display
```

## Usage

1. Navigate to `/dashboard` after authentication
2. View analytics overview at the top
3. Manage connections in the left panel
4. Set up Stripe payments in the right panel
5. Use header navigation to access other features

## Future Enhancements

- Real-time analytics data
- Advanced filtering and search
- Export capabilities
- Custom dashboard widgets
- Notification system
- Advanced Stripe management features

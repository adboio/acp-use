// In-memory storage for checkout sessions (replace with DB in production)
// Use globalThis to persist across Next.js hot reloads in development
const globalForCheckout = globalThis as unknown as {
  checkoutSessions: Map<string, any> | undefined;
};

export const checkoutSessions =
  globalForCheckout.checkoutSessions ?? new Map<string, any>();

if (process.env.NODE_ENV !== "production") {
  globalForCheckout.checkoutSessions = checkoutSessions;
}

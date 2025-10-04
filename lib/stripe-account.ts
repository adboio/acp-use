import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});


export type ConnectedAccountStatus = {
  connected: boolean;
  account_id?: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  capabilities?: Record<string, string>;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
    disabled_reason: string | null;
    current_deadline: number | null;
  } | null;
  onboarding_complete?: boolean;
  can_publish?: boolean;
  missing_information_count?: number;
};

export async function getConnectedAccountStatus(
  accountId?: string | null,
): Promise<ConnectedAccountStatus> {
  if (!accountId) {
    return { connected: false };
  }

  const account = await stripe.accounts.retrieve(accountId);

  const requirements = (account as any).requirements
    ? {
        currently_due: (account as any).requirements.currently_due ?? [],
        eventually_due: (account as any).requirements.eventually_due ?? [],
        past_due: (account as any).requirements.past_due ?? [],
        disabled_reason: (account as any).requirements.disabled_reason ?? null,
        current_deadline:
          (account as any).requirements.current_deadline ?? null,
      }
    : null;

  const details_submitted = (account as any).details_submitted ?? false;
  const charges_enabled = (account as any).charges_enabled ?? false;
  const payouts_enabled = (account as any).payouts_enabled ?? false;
  const capabilities = (account as any).capabilities ?? {};

  const missing_information_count = requirements
    ? (requirements.currently_due?.length ?? 0) +
      (requirements.past_due?.length ?? 0)
    : 0;

  const onboarding_complete = Boolean(
    details_submitted &&
      charges_enabled &&
      payouts_enabled &&
      missing_information_count === 0 &&
      !(requirements && requirements.disabled_reason),
  );

  const can_publish = Boolean(
    (capabilities?.card_payments === "active" || charges_enabled) &&
      (capabilities?.transfers === "active" || payouts_enabled),
  );

  return {
    connected: true,
    account_id: accountId,
    details_submitted,
    charges_enabled,
    payouts_enabled,
    requirements,
    capabilities,
    onboarding_complete,
    can_publish,
    missing_information_count,
  };
}

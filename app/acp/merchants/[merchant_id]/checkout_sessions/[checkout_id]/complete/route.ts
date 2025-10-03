import { NextResponse, type NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { merchant_id: string; checkout_id: string } },
) {
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  // Mock implementation for completing a checkout session
  const completed_session = {
    id: params.checkout_id,
    status: "completed",
    completed_at: new Date().toISOString(),
    payment_intent: {
      id: `pi_${Date.now()}`,
      status: "succeeded",
    },
  } as const;

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  return NextResponse.json(completed_session, { status: 200, headers });
}

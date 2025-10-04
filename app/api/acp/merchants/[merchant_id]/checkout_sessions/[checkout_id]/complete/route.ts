import { NextResponse, type NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchant_id: string; checkout_id: string }> },
) {
  const { merchant_id, checkout_id } = await params;
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  console.log("✅ [ACP-COMPLETE] Completing checkout session:", checkout_id);
  console.log("✅ [ACP-COMPLETE] Merchant:", merchant_id);
  console.log("✅ [ACP-COMPLETE] Request headers:", {
    requestId,
    idempotencyKey,
    contentType: request.headers.get("content-type"),
  });

  let sharedPaymentToken: string | undefined;
  try {
    const body = await request.json();
    console.log(
      "✅ [ACP-COMPLETE] Request body:",
      JSON.stringify(body, null, 2),
    );
    sharedPaymentToken = body.shared_payment_token;
  } catch (error) {
    console.log("✅ [ACP-COMPLETE] No request body or error parsing:", error);
  }

  // Mock implementation for completing a checkout session
  const completed_session = {
    id: checkout_id,
    status: "completed",
    completed_at: new Date().toISOString(),
    payment_intent: {
      id: `pi_${Date.now()}`,
      status: "succeeded",
    },
    shared_payment_token: sharedPaymentToken,
  } as const;

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  console.log(
    "✅ [ACP-COMPLETE] Returning completed session:",
    JSON.stringify(completed_session, null, 2),
  );
  return NextResponse.json(completed_session, { status: 200, headers });
}

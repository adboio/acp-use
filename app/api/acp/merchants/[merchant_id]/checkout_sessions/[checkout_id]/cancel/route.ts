import { NextResponse, type NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchant_id: string; checkout_id: string }> },
) {
  const { merchant_id, checkout_id } = await params;
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  console.log("merchant_id", merchant_id);

  // Mock implementation for canceling a checkout session
  const canceled_session = {
    id: checkout_id,
    status: "canceled",
    canceled_at: new Date().toISOString(),
  } as const;

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  return NextResponse.json(canceled_session, { status: 200, headers });
}

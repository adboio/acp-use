import { NextResponse, type NextRequest } from "next/server";
import { checkoutSessions } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchant_id: string; checkout_id: string }> },
) {
  const { merchant_id, checkout_id } = await params;
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  console.log("🔍 [ACP-GET] Retrieving checkout session:", checkout_id);
  console.log("🔍 [ACP-GET] Merchant:", merchant_id);
  console.log(`🔍 [ACP-GET] Total sessions in memory: ${checkoutSessions.size}`);
  console.log(`🔍 [ACP-GET] Available session IDs:`, Array.from(checkoutSessions.keys()));

  // Retrieve the stored checkout session
  const checkout_session = checkoutSessions.get(checkout_id);

  if (!checkout_session) {
    console.error("❌ [ACP-GET] Checkout session not found:", checkout_id);
    return NextResponse.json(
      { error: "Checkout session not found" },
      { status: 404 }
    );
  }

  console.log("✅ [ACP-GET] Found checkout session:", JSON.stringify(checkout_session, null, 2));

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  return NextResponse.json(checkout_session, { status: 200, headers });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchant_id: string; checkout_id: string }> },
) {
  const { merchant_id, checkout_id } = await params;
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  console.log("📝 [ACP-UPDATE] Updating checkout session:", checkout_id);
  console.log("📝 [ACP-UPDATE] Merchant:", merchant_id);
  console.log("📝 [ACP-UPDATE] Request headers:", {
    requestId,
    idempotencyKey,
    contentType: request.headers.get("content-type"),
  });

  let updateData: any = {};
  try {
    const body = await request.json();
    console.log("📝 [ACP-UPDATE] Request body:", JSON.stringify(body, null, 2));
    updateData = body;
  } catch (error) {
    console.error("❌ [ACP-UPDATE] Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Get existing checkout session
  const existingSession = checkoutSessions.get(checkout_id);
  
  if (!existingSession) {
    console.error("❌ [ACP-UPDATE] Checkout session not found:", checkout_id);
    return NextResponse.json(
      { error: "Checkout session not found" },
      { status: 404 }
    );
  }

  // Update the session
  const updated_session = {
    ...existingSession,
    fulfillment_option_id: updateData.fulfillment_option_id ?? existingSession.fulfillment_option_id,
    contact: updateData.contact ?? existingSession.contact,
    notes: updateData.notes ?? existingSession.notes,
    updated_at: new Date().toISOString(),
  };

  // Store the updated session
  checkoutSessions.set(checkout_id, updated_session);
  console.log(`📝 [ACP-UPDATE] Updated checkout session ${checkout_id} in memory`);

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  console.log(
    "📝 [ACP-UPDATE] Returning updated session:",
    JSON.stringify(updated_session, null, 2),
  );
  return NextResponse.json(updated_session, { status: 200, headers });
}

import { NextResponse, type NextRequest } from "next/server";

type ItemInput = {
  id: string;
  quantity: number;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchant_id: string }> },
) {
  const { merchant_id } = await params;
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  console.log(
    "🛒 [ACP-CREATE] Creating checkout session for merchant:",
    merchant_id,
  );
  console.log("🛒 [ACP-CREATE] Request headers:", {
    requestId,
    idempotencyKey,
    contentType: request.headers.get("content-type"),
  });

  let items: ItemInput[] = [];
  try {
    const body = await request.json();
    console.log("🛒 [ACP-CREATE] Request body:", JSON.stringify(body, null, 2));

    if (Array.isArray(body?.items)) {
      items = body.items.filter(
        (it: any): it is ItemInput =>
          typeof it?.id === "string" && Number.isFinite(it?.quantity),
      );
      console.log(
        "🛒 [ACP-CREATE] Parsed items:",
        JSON.stringify(items, null, 2),
      );
    }
  } catch (error) {
    console.error("❌ [ACP-CREATE] Error parsing request body:", error);
    // ignore parse errors and fall back to empty items
  }

  // Provide a default item if none were supplied to make the mock useful
  if (items.length === 0) {
    items = [{ id: "item_mock_001", quantity: 1 }];
  }

  // Build mock line items. Use a flat base amount per unit for demonstration.
  const currency = "usd";
  const unitBaseAmount = 1500; // $15.00 in minor units
  const taxRate = 0.08; // 8% mock tax

  const line_items = items.map((item, index) => {
    const base_amount = unitBaseAmount * Math.max(1, item.quantity);
    const discount = 0;
    const subtotal = base_amount - discount;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;
    return {
      id: `li_${index + 1}`,
      item,
      base_amount,
      discount,
      subtotal,
      tax,
      total,
    };
  });

  const items_base_amount = line_items.reduce(
    (sum, li) => sum + li.base_amount,
    0,
  );
  const items_discount = line_items.reduce((sum, li) => sum + li.discount, 0);
  const subtotal = items_base_amount - items_discount;
  const fulfillmentCost = 0; // digital fulfillment for the mock
  const tax = line_items.reduce((sum, li) => sum + li.tax, 0);
  const fee = 0;
  const total = subtotal + fulfillmentCost + tax + fee;

  const checkout_session = {
    id: `checkout_session_${Date.now()}`,
    buyer: undefined,
    payment_provider: {
      provider: "stripe",
      supported_payment_methods: ["card"],
    },
    status: "ready_for_payment",
    currency,
    line_items,
    fulfillment_address: undefined,
    fulfillment_options: [
      {
        type: "digital",
        id: "digital_instant",
        title: "Instant delivery",
        subtitle: "Delivered via email after purchase",
        subtotal: 0,
        tax: 0,
        total: 0,
      },
    ],
    fulfillment_option_id: "digital_instant",
    totals: [
      {
        type: "items_base_amount",
        display_text: "Item(s) total",
        amount: items_base_amount,
      },
      {
        type: "items_discount",
        display_text: "Item(s) discount",
        amount: items_discount,
      },
      {
        type: "subtotal",
        display_text: "Subtotal",
        amount: subtotal,
      },
      {
        type: "fulfillment",
        display_text: "Fulfillment",
        amount: fulfillmentCost,
      },
      {
        type: "tax",
        display_text: "Tax",
        amount: tax,
      },
      {
        type: "fee",
        display_text: "Fees",
        amount: fee,
      },
      {
        type: "total",
        display_text: "Total",
        amount: total,
      },
    ],
    messages: [],
    links: [
      {
        type: "tos",
        title: "Terms of Service",
        url: "https://example.com/tos",
      },
      {
        type: "privacy",
        title: "Privacy Policy",
        url: "https://example.com/privacy",
      },
    ],
  } as const;

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  console.log(
    "🛒 [ACP-CREATE] Returning checkout session:",
    JSON.stringify(checkout_session, null, 2),
  );
  return NextResponse.json(checkout_session, { status: 201, headers });
}

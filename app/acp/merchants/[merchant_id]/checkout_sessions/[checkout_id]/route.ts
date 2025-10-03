import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { merchant_id: string; checkout_id: string } },
) {
  const requestId = request.headers.get("Request-Id") ?? undefined;
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

  const currency = "usd";
  const unitBaseAmount = 1500; // $15.00 in minor units
  const taxRate = 0.08; // 8% mock tax

  const item = { id: "item_mock_001", quantity: 1 } as const;
  const base_amount = unitBaseAmount * item.quantity;
  const discount = 0;
  const subtotal = base_amount - discount;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  const line_items = [
    {
      id: "li_1",
      item,
      base_amount,
      discount,
      subtotal,
      tax,
      total,
    },
  ];

  const items_base_amount = base_amount;
  const items_discount = discount;
  const fulfillmentCost = 0;
  const fee = 0;

  const checkout_session = {
    id: params.checkout_id,
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

  return NextResponse.json(checkout_session, { status: 200, headers });
}

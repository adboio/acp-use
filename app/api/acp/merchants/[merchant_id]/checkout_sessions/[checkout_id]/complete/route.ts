import { NextResponse, type NextRequest } from "next/server";
import { oauthManager } from "@/lib/oauth/manager";
import { checkoutSessions } from "../../route";

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
  let requestBody: any = {};
  try {
    requestBody = await request.json();
    console.log(
      "✅ [ACP-COMPLETE] Request body:",
      JSON.stringify(requestBody, null, 2),
    );
    sharedPaymentToken = requestBody.shared_payment_token;
  } catch (error) {
    console.log("✅ [ACP-COMPLETE] No request body or error parsing:", error);
  }

  // Create Square orders for connected Square accounts
  const squareOrders: any[] = [];
  try {
    console.log("🤖 [ACP-COMPLETE] Checking for Square connections...");
    const connections = await oauthManager.getConnections(merchant_id);
    const squareConnections = connections.filter(conn => conn.provider === "square");
    
    console.log(`🤖 [ACP-COMPLETE] Found ${squareConnections.length} Square connections`);

    for (const connection of squareConnections) {
      try {
        const provider = oauthManager.getProvider("square");
        if (!provider || !provider.createOrder) {
          console.log("🤖 [ACP-COMPLETE] Square provider doesn't support order creation");
          continue;
        }

        // Check if token is expired and refresh if needed
        let accessToken = connection.tokens.accessToken;
        if (connection.tokens.expiresAt && connection.tokens.expiresAt < new Date()) {
          console.log("🤖 [ACP-COMPLETE] Token expired, refreshing...");
          const refreshedConnection = await oauthManager.refreshConnection(connection.id);
          accessToken = refreshedConnection.tokens.accessToken;
        }

        // Get the actual checkout session data to create accurate Square orders
        // Use the parsed request body to get line items and other checkout data
        const lineItems = requestBody.line_items || [];
        
        if (lineItems.length === 0) {
          // Fallback to a default item if no line items provided
          // Try to get a real product price from the feed
          let fallbackPrice = 1500; // Default fallback
          try {
            const feedResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/${merchant_id}`,
            );
            const feedData = await feedResponse.json();
            const firstProduct = feedData.products?.[0];
            if (firstProduct?.price) {
              fallbackPrice = firstProduct.price;
            }
          } catch (error) {
            console.log("🤖 [ACP-COMPLETE] Could not fetch product data for fallback, using default price");
          }
          
          lineItems.push({
            id: "default_item",
            item: {
              id: "default_item",
              name: "Checkout Item",
              quantity: 1,
            },
            base_amount: fallbackPrice,
          });
        }

        const checkoutSessionData = {
          currency: requestBody.currency || "usd",
          line_items: lineItems,
          totals: requestBody.totals || [],
        };

        console.log("🤖 [ACP-COMPLETE] Using checkout session data:", JSON.stringify(checkoutSessionData, null, 2));

        // Transform checkout session line items to Square format
        // Handle both nested structure (from checkout session) and flat structure (from request body)
        const squareLineItems = checkoutSessionData.line_items.map((lineItem: any) => {
          // Extract item data - could be nested in 'item' property or flat
          const itemData = lineItem.item || lineItem;
          const itemId = itemData.id || lineItem.id || `item_${Date.now()}`;
          const itemName = itemData.name || lineItem.name || "Product";
          const itemQuantity = itemData.quantity || lineItem.quantity || 1;
          const totalBaseAmount = lineItem.base_amount || 0;
          
          // IMPORTANT: base_amount from checkout is total for all quantities
          // Square expects unit price, so divide by quantity
          const unitBaseAmount = Math.round(totalBaseAmount / itemQuantity);
          
          return {
            id: itemId,
            name: itemName,
            quantity: itemQuantity,
            baseAmount: unitBaseAmount, // Unit price, not total
            currency: checkoutSessionData.currency || "usd",
          };
        });

        console.log("🤖 [ACP-COMPLETE] Transformed Square line items:", JSON.stringify(squareLineItems, null, 2));

        // Extract totals from checkout session
        const taxAmount = checkoutSessionData.totals.find((t: any) => t.type === "tax")?.amount || 0;
        const checkoutTotal = checkoutSessionData.totals.find((t: any) => t.type === "total")?.amount || 0;
        
        console.log("🤖 [ACP-COMPLETE] Checkout session tax amount:", taxAmount);
        console.log("🤖 [ACP-COMPLETE] Checkout session total amount:", checkoutTotal);
        
        const orderData = {
          idempotencyKey: `acp_${checkout_id}_${Date.now()}`,
          lineItems: squareLineItems,
          referenceId: checkout_id,
          paymentIntentId: sharedPaymentToken, // Pass the Stripe payment intent ID
          totalAmount: checkoutTotal, // Pass the correct total amount
          taxAmount: taxAmount, // Pass the tax amount
        };

        console.log("🤖 [ACP-COMPLETE] Creating Square order...");
        const squareOrder = await provider.createOrder(accessToken, orderData);
        squareOrders.push({
          connectionId: connection.id,
          orderId: squareOrder.id,
          version: squareOrder.version,
          status: squareOrder.state,
        });
        
        console.log("🤖 [ACP-COMPLETE] Square order created:", squareOrder.id);
      } catch (error) {
        console.error("🤖 [ACP-COMPLETE] Error creating Square order:", error);
        // Continue with other connections even if one fails
      }
    }
  } catch (error) {
    console.error("🤖 [ACP-COMPLETE] Error processing Square connections:", error);
    // Continue with checkout completion even if Square integration fails
  }

  // Get and update the stored checkout session
  const existingSession = checkoutSessions.get(checkout_id);
  
  // Create completed session response
  const completed_session = {
    ...(existingSession || {}),
    id: checkout_id,
    status: "completed",
    completed_at: new Date().toISOString(),
    payment_intent: {
      id: sharedPaymentToken || `pi_${Date.now()}`,
      status: "succeeded",
    },
    shared_payment_token: sharedPaymentToken,
    square_orders: squareOrders, // Include Square order information
  } as const;

  // Store the completed session
  checkoutSessions.set(checkout_id, completed_session);
  console.log(`✅ [ACP-COMPLETE] Marked checkout session ${checkout_id} as completed in memory`);

  const headers = new Headers();
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  if (requestId) headers.set("Request-Id", requestId);

  console.log(
    "✅ [ACP-COMPLETE] Returning completed session:",
    JSON.stringify(completed_session, null, 2),
  );
  return NextResponse.json(completed_session, { status: 200, headers });
}

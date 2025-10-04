import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tool implementations
async function get_feed() {
  console.log("🔍 [get_feed] Starting to fetch product catalog...");
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed`;
    console.log("🔍 [get_feed] Fetching from URL:", url);

    const response = await fetch(url);
    console.log("🔍 [get_feed] Response status:", response.status);

    const data = await response.json();
    console.log("🔍 [get_feed] Response data:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("❌ [get_feed] Error:", error);
    throw error;
  }
}

async function create_checkout(args: {
  line_items: { id: string; quantity: number }[];
}) {
  console.log("🛒 [create_checkout] Starting checkout creation...");
  console.log("🛒 [create_checkout] Args:", JSON.stringify(args, null, 2));

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/acp/merchants/demo_merchant/checkout_sessions`;
    console.log("🛒 [create_checkout] POST URL:", url);

    const requestBody = {
      items: args.line_items.map((li) => ({
        id: li.id,
        quantity: li.quantity,
      })),
    };
    console.log(
      "🛒 [create_checkout] Request body:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("🛒 [create_checkout] Response status:", response.status);
    const data = await response.json();
    console.log(
      "🛒 [create_checkout] Response data:",
      JSON.stringify(data, null, 2),
    );

    return data;
  } catch (error) {
    console.error("❌ [create_checkout] Error:", error);
    throw error;
  }
}

async function update_checkout(args: {
  session_id: string;
  fulfillment_option_id?: string;
  contact?: { name?: string; phone?: string; email?: string };
  notes?: string;
}) {
  console.log("📝 [update_checkout] Starting checkout update...");
  console.log("📝 [update_checkout] Args:", JSON.stringify(args, null, 2));

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/acp/merchants/demo_merchant/checkout_sessions/${args.session_id}`;
    console.log("📝 [update_checkout] POST URL:", url);

    const requestBody = {
      fulfillment_option_id: args.fulfillment_option_id,
      contact: args.contact,
      notes: args.notes,
    };
    console.log(
      "📝 [update_checkout] Request body:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("📝 [update_checkout] Response status:", response.status);
    const data = await response.json();
    console.log(
      "📝 [update_checkout] Response data:",
      JSON.stringify(data, null, 2),
    );

    return data;
  } catch (error) {
    console.error("❌ [update_checkout] Error:", error);
    throw error;
  }
}

async function complete_checkout(args: {
  session_id: string;
  shared_payment_token?: string;
}) {
  console.log("✅ [complete_checkout] Starting checkout completion...");
  console.log("✅ [complete_checkout] Args:", JSON.stringify(args, null, 2));

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/acp/merchants/demo_merchant/checkout_sessions/${args.session_id}/complete`;
    console.log("✅ [complete_checkout] POST URL:", url);

    const requestBody = {
      shared_payment_token: args.shared_payment_token,
    };
    console.log(
      "✅ [complete_checkout] Request body:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("✅ [complete_checkout] Response status:", response.status);
    const data = await response.json();
    console.log(
      "✅ [complete_checkout] Response data:",
      JSON.stringify(data, null, 2),
    );

    return data;
  } catch (error) {
    console.error("❌ [complete_checkout] Error:", error);
    throw error;
  }
}

// Tool schemas for OpenAI
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_feed",
      description:
        "Fetch available products and shipping options from the merchant's product catalog.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_checkout",
      description:
        "Create an ACP checkout session for selected products. This prepares the order for payment but does NOT confirm the purchase - payment must be completed first. Use this when the customer is ready to buy - the checkout UI will handle contact details and payment.",
      parameters: {
        type: "object",
        properties: {
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                quantity: { type: "integer", minimum: 1 },
              },
              required: ["id", "quantity"],
              additionalProperties: false,
            },
          },
        },
        required: ["line_items"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_checkout",
      description:
        "Update an existing order session with selected shipping option and contact details. Only use this if the customer wants to change their selection after checkout is created.",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          fulfillment_option_id: { type: "string" },
          contact: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
            },
            additionalProperties: false,
          },
          notes: { type: "string" },
        },
        required: ["session_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "complete_checkout",
      description:
        "Complete the order and process payment for the products. This is the final step that actually confirms and processes the purchase after payment details have been collected in the chat UI.",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          shared_payment_token: { type: "string" },
        },
        required: ["session_id"],
        additionalProperties: false,
      },
    },
  },
];

export async function POST(request: NextRequest) {
  console.log("🤖 [CHAT] Starting chat request...");
  try {
    const { messages } = await request.json();
    console.log(
      "🤖 [CHAT] Received messages:",
      JSON.stringify(messages, null, 2),
    );

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ [CHAT] OpenAI API key not configured");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful AI shopping assistant that can help customers discover and purchase products using the Agentic Commerce Protocol (ACP).

Your capabilities:
- get_feed: Fetch available products and shipping options
- create_checkout: Create a new order session with selected products
- update_checkout: Update order with shipping preferences and contact details
- complete_checkout: Process payment and confirm the purchase

Guidelines:
- Always be helpful and friendly
- Ask clarifying questions about product preferences, size, color, etc.
- Show available products and categories when customers want to browse
- Create order sessions for products when customers are ready to buy
- Explain pricing, shipping, and product details clearly
- When a customer wants to buy, create the checkout session immediately - don't ask for contact details first
- After creating a checkout session, the payment form will appear automatically in this chat - no need to provide links or redirect users
- The checkout UI will handle collecting contact information and payment details
- Be specific about product features, availability, and shipping options
- IMPORTANT: Never say an order is "confirmed" or "purchased" until payment is complete - only say it's "ready for payment" or "pending payment"

Remember: You're representing an e-commerce store and should maintain a professional, helpful tone while making the shopping experience smooth and efficient. Focus on helping customers find the right products. When they're ready to buy, create the checkout session right away. The payment form will appear directly in this chat conversation. Only confirm the purchase is complete after payment is processed.`,
    };

    const allMessages = [systemMessage, ...messages];
    const state: any = {};
    console.log("🤖 [CHAT] Starting conversation loop...");

    while (true) {
      console.log("🤖 [CHAT] Calling OpenAI API...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: allMessages,
        tools,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;
      console.log(
        "🤖 [CHAT] OpenAI response:",
        JSON.stringify(message, null, 2),
      );

      // If the model wants to call a tool:
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(
          "🔧 [CHAT] Model wants to call tools:",
          message.tool_calls.length,
        );

        // Add the assistant's message with tool calls
        allMessages.push({
          role: "assistant",
          content: message.content,
          tool_calls: message.tool_calls,
        });

        // Execute tool calls
        for (const call of message.tool_calls) {
          const functionName =
            call.type === "function" && "function" in call
              ? call.function?.name
              : "unknown";
          console.log("🔧 [CHAT] Executing tool call:", functionName);
          let toolResult: any;
          try {
            // Type guard to check if it's a function tool call
            if (call.type === "function" && "function" in call) {
              const args = JSON.parse(call.function.arguments || "{}");
              console.log(
                "🔧 [CHAT] Tool arguments:",
                JSON.stringify(args, null, 2),
              );

              if (call.function.name === "get_feed") {
                toolResult = await get_feed();
              } else if (call.function.name === "create_checkout") {
                toolResult = await create_checkout(args);
                if (toolResult?.id && toolResult?.status) {
                  state.session = toolResult;
                  console.log(
                    "🔧 [CHAT] Updated state.session:",
                    JSON.stringify(state.session, null, 2),
                  );
                }
              } else if (call.function.name === "update_checkout") {
                toolResult = await update_checkout(args);
                if (toolResult?.id && toolResult?.status) {
                  state.session = toolResult;
                  console.log(
                    "🔧 [CHAT] Updated state.session:",
                    JSON.stringify(state.session, null, 2),
                  );
                }
              } else if (call.function.name === "complete_checkout") {
                toolResult = await complete_checkout(args);
                if (toolResult?.id && toolResult?.status) {
                  state.session = toolResult;
                  console.log(
                    "🔧 [CHAT] Updated state.session:",
                    JSON.stringify(state.session, null, 2),
                  );
                }
              }
            }

            console.log(
              "🔧 [CHAT] Tool result:",
              JSON.stringify(toolResult, null, 2),
            );
            allMessages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(toolResult),
            });
          } catch (e: any) {
            console.error("❌ [CHAT] Tool execution error:", e);
            allMessages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify({ error: e.message || String(e) }),
            });
          }
        }
        // Continue the loop to let the model process tool results
        console.log("🔧 [CHAT] Continuing loop to process tool results...");
        continue;
      }

      // No tool calls: the model produced final text
      console.log("🤖 [CHAT] Model produced final response:", message.content);
      console.log("🤖 [CHAT] Final state:", JSON.stringify(state, null, 2));
      return NextResponse.json({
        content: message.content,
        session: state.session,
        messages: allMessages,
      });
    }
  } catch (error) {
    console.error("❌ [CHAT] OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

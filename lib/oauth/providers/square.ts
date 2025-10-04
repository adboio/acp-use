import { BaseOAuthProvider } from "../base-provider";
import {
  OAuthConfig,
  OAuthTokens,
  OAuthUserInfo,
  OAuthProviderCapabilities,
} from "../types";

export class SquareOAuthProvider extends BaseOAuthProvider {
  readonly name = "square";
  readonly capabilities: OAuthProviderCapabilities = {
    supportsRefresh: true,
    supportsRevocation: true,
    tokenExpiryDays: 30,
    refreshTokenExpiryDays: 365, // Square refresh tokens don't expire
    maxTokensPerUser: 10, // Square allows multiple access tokens per refresh token
  };

  constructor(config: OAuthConfig) {
    super(config);
  }

  generateAuthUrl(
    state: string,
    additionalParams: Record<string, string> = {},
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(" "),
      state,
      session: "false", // Don't require existing Square session
      ...additionalParams,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    state: string,
  ): Promise<OAuthTokens> {
    console.log("🤖 [SQUARE] Exchanging code for tokens:", code, state);
    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2025-01-23",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    console.log(
      "🤖 [SQUARE] Token response data:",
      JSON.stringify(data, null, 2),
    );

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Square OAuth error: ${data.errors[0].detail}`);
    }

    // Handle different possible formats for expires_at
    let expiresAt: Date | undefined;
    if (data.expires_at) {
      try {
        // Try as Unix timestamp (seconds)
        if (typeof data.expires_at === "number") {
          expiresAt = new Date(data.expires_at * 1000);
        } else if (typeof data.expires_at === "string") {
          // Try parsing as ISO string or other formats
          expiresAt = new Date(data.expires_at);
        }
        console.log(
          "🤖 [SQUARE] Parsed expires_at:",
          data.expires_at,
          "->",
          expiresAt,
        );
      } catch (error) {
        console.error(
          "🤖 [SQUARE] Error parsing expires_at:",
          data.expires_at,
          error,
        );
        expiresAt = undefined;
      }
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await this.makeRequest(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": "2025-01-23",
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Square refresh error: ${data.errors[0].detail}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Square may return new refresh token
      expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      const revokeUrl =
        this.config.environment === "production"
          ? "https://connect.squareup.com/oauth2/revoke"
          : "https://connect.squareupsandbox.com/oauth2/revoke";

      await this.makeRequest(revokeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Square-Version": "2025-01-23",
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          access_token: token,
        }),
      });

      return true;
    } catch (error) {
      console.error("Failed to revoke Square token:", error);
      return false;
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // Square doesn't have a direct user info endpoint, but we can get merchant info
    const response = await this.makeRequest(
      `${this.config.environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com"}/v2/merchants`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Square-Version": "2025-01-23",
        },
      },
    );

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(`Square API error: ${data.errors[0].detail}`);
    }

    const merchant = data.merchant?.[0];
    if (!merchant) {
      throw new Error("No merchant information found");
    }

    return {
      id: merchant.id,
      email: merchant.business_name, // Square doesn't provide email in merchant info
      name: merchant.business_name,
      platform: "square",
      rawData: merchant,
    };
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      console.log("🤖 [SQUARE] Error validating token:", error);
      return false;
    }
  }

  async getProducts(accessToken: string): Promise<any[]> {
    const baseUrl =
      this.config.environment === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com";

    try {
      console.log("🤖 [SQUARE] Fetching products from Square API...");

      const response = await this.makeRequest(
        `${baseUrl}/v2/catalog/list?types=ITEM`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Square-Version": "2025-01-23",
          },
        },
      );

      const data = await response.json();
      // console.log("🤖 [SQUARE] Products API response:", JSON.stringify(data, null, 2));

      if (data.errors && data.errors.length > 0) {
        throw new Error(`Square API error: ${data.errors[0].detail}`);
      }

      const items = data.objects || [];
      console.log(`🤖 [SQUARE] Found ${items.length} products`);

      // Transform Square catalog items to our product format
      return items.map((item: any) => this.transformSquareItemToProduct(item));
    } catch (error) {
      console.error("🤖 [SQUARE] Error fetching products:", error);
      throw new Error(
        `Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async createOrder(
    accessToken: string,
    orderData: {
      idempotencyKey: string;
      lineItems: Array<{
        id: string;
        name: string;
        quantity: number;
        baseAmount: number;
        currency: string;
      }>;
      locationId?: string;
      referenceId?: string;
      paymentIntentId?: string;
      totalAmount?: number;
      taxAmount?: number;
    },
  ): Promise<any> {
    const baseUrl =
      this.config.environment === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com";

    try {
      console.log(
        "🤖 [SQUARE] Creating order in Square...",
        JSON.stringify(orderData, null, 2),
      );

      // First, get the merchant's locations to find a valid location_id
      let locationId = orderData.locationId;
      if (!locationId) {
        const locationsResponse = await this.makeRequest(
          `${baseUrl}/v2/locations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Square-Version": "2025-01-23",
            },
          },
        );

        const locationsData = await locationsResponse.json();
        if (locationsData.errors && locationsData.errors.length > 0) {
          throw new Error(
            `Square locations error: ${locationsData.errors[0].detail}`,
          );
        }

        const locations = locationsData.locations || [];
        if (locations.length === 0) {
          throw new Error("No Square locations found for this merchant");
        }

        locationId = locations[0].id;
        console.log("🤖 [SQUARE] Using location ID:", locationId);
      }

      // Transform line items to Square format
      const squareLineItems = orderData.lineItems.map((item) => ({
        name: item.name,
        quantity: item.quantity.toString(),
        base_price_money: {
          amount: item.baseAmount,
          currency: item.currency.toUpperCase(),
        },
        // Don't include catalog_object_id to avoid catalog lookup issues
        // Square will create a custom line item instead
      }));

      // Use the passed total amount or calculate from line items as fallback
      const totalAmount =
        orderData.totalAmount ||
        squareLineItems.reduce(
          (sum, item) =>
            sum + item.base_price_money.amount * parseInt(item.quantity),
          0,
        );
      console.log("🤖 [SQUARE] Using total amount for tender:", totalAmount);

      // Build the order payload
      // For external payments (Stripe), create as OPEN order without tenders
      // The payment has already been processed externally
      const orderPayload: any = {
        idempotency_key: orderData.idempotencyKey,
        order: {
          location_id: locationId,
          reference_id: orderData.referenceId || `acp_${Date.now()}`,
          line_items: squareLineItems,
          state: "OPEN", // OPEN state for external payments
        },
      };

      // Add service charge for tax if provided
      if (orderData.taxAmount && orderData.taxAmount > 0) {
        console.log(
          "🤖 [SQUARE] Adding tax as service charge:",
          orderData.taxAmount,
        );
        orderPayload.order.service_charges = [
          {
            name: "Tax",
            amount_money: {
              amount: orderData.taxAmount,
              currency:
                orderData.lineItems[0]?.currency?.toUpperCase() || "USD",
            },
            calculation_phase: "TOTAL_PHASE",
          },
        ];
      }

      // Don't add tenders for external payments
      // Payment was already processed by Stripe - just track it in metadata
      console.log(
        "🤖 [SQUARE] Not adding tenders - payment processed externally via Stripe",
      );

      // Add fulfillment and metadata
      orderPayload.order.fulfillments = [
        {
          type: "PICKUP",
          state: "PROPOSED", // PROPOSED state for OPEN orders
          pickup_details: {
            recipient: {
              display_name: "Customer",
            },
            pickup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            expires_at: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 7 days from now
          },
          metadata: {
            source: "acp_checkout",
            payment_provider: "stripe",
            external_payment: "true",
            payment_intent_id: orderData.paymentIntentId || "external",
            stripe_amount: totalAmount.toString(), // Track the Stripe payment amount
          },
        },
      ];

      orderPayload.order.metadata = {
        source: "acp_checkout",
        payment_provider: "stripe",
        external_payment: "true",
        payment_intent_id: orderData.paymentIntentId || "external",
        stripe_payment_status: "succeeded",
        stripe_amount: totalAmount.toString(),
      };

      console.log(
        "🤖 [SQUARE] Order payload:",
        JSON.stringify(orderPayload, null, 2),
      );

      const response = await this.makeRequest(`${baseUrl}/v2/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Square-Version": "2025-01-23",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      console.log(
        "🤖 [SQUARE] Order creation response:",
        JSON.stringify(data, null, 2),
      );

      if (data.errors && data.errors.length > 0) {
        throw new Error(
          `Square order creation error: ${data.errors[0].detail}`,
        );
      }

      const createdOrder = data.order;
      console.log(
        "🤖 [SQUARE] Order created successfully:",
        createdOrder.id,
        "version:",
        createdOrder.version,
      );

      // Note: We leave the order as OPEN because Square requires payment to be processed
      // through Square to mark as COMPLETED. Since payment was processed via Stripe,
      // the order will show as OPEN in Square dashboard with metadata indicating
      // the external payment details. Merchants can manually complete if needed.
      console.log(
        "🤖 [SQUARE] Order created as OPEN (payment processed externally via Stripe)",
      );
      console.log(
        "🤖 [SQUARE] Order metadata contains Stripe payment details:",
        {
          payment_intent_id: orderData.paymentIntentId,
          stripe_amount: totalAmount,
          payment_status: "succeeded",
        },
      );

      return createdOrder;
    } catch (error) {
      console.error("🤖 [SQUARE] Error creating order:", error);
      throw new Error(
        `Failed to create Square order: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async updateOrderStatus(
    accessToken: string,
    orderId: string,
    version: number,
    status: "OPEN" | "COMPLETED" | "CANCELED",
  ): Promise<any> {
    const baseUrl =
      this.config.environment === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com";

    try {
      console.log(`🤖 [SQUARE] Updating order ${orderId} to status: ${status}`);

      const updatePayload = {
        order: {
          version: version,
          state: status,
        },
      };

      const response = await this.makeRequest(
        `${baseUrl}/v2/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Square-Version": "2025-01-23",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        },
      );

      const data = await response.json();
      console.log(
        "🤖 [SQUARE] Order update response:",
        JSON.stringify(data, null, 2),
      );

      if (data.errors && data.errors.length > 0) {
        throw new Error(`Square order update error: ${data.errors[0].detail}`);
      }

      return data.order;
    } catch (error) {
      console.error("🤖 [SQUARE] Error updating order:", error);
      throw new Error(
        `Failed to update Square order: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private transformSquareItemToProduct(item: any): any {
    const itemData = item.item_data;
    const variations = itemData?.variations || [];

    console.log(
      `🔍 [SQUARE] Raw Square item data for ${item.id}:`,
      JSON.stringify(item, null, 2),
    );
    console.log(`🔍 [SQUARE] Item data:`, JSON.stringify(itemData, null, 2));
    console.log(`🔍 [SQUARE] Variations:`, JSON.stringify(variations, null, 2));

    // Get the first variation for basic pricing info
    const firstVariation = variations[0];
    const priceMoney = firstVariation?.item_variation_data?.price_money;

    console.log(
      `🔍 [SQUARE] First variation:`,
      JSON.stringify(firstVariation, null, 2),
    );
    console.log(
      `🔍 [SQUARE] Price money:`,
      JSON.stringify(priceMoney, null, 2),
    );

    // Square image ID to local image mapping
    const squareImageMapping: Record<string, string> = {
      square_4ASJKQLTJROKY4BOF6EMSNAE: "/supabase.jpeg",
      square_G4C7H6MMPA3ZBGPEYJ726H2G: "/datadog.png",
      square_4WCWAQHGXCACN5GJTM63FJIL: "/figma.png",
      square_IXJGYW3DEE5I6GIX4KFCJ2HC: "/snap.png",
      square_Y3BLHAXMLJDW54UUEZHB76J7: "/yc.png",
    };

    const productId = `square_${item.id}`;
    const mappedImage = squareImageMapping[productId];

    console.log(
      `🖼️ [SQUARE] Product ID: ${productId}, Mapped image: ${mappedImage}`,
    );

    // Use mapped image if available, otherwise fallback to placeholder
    const images = mappedImage
      ? [
          {
            url: mappedImage,
            alt: itemData?.name || "Product image",
          },
        ]
      : [
          {
            url: "https://via.placeholder.com/300x300?text=Square+Product",
            alt: itemData?.name || "Product image",
          },
        ];

    console.log(`🖼️ [SQUARE] Final images for ${productId}:`, images);

    const productPrice = priceMoney?.amount || 0;
    console.log(
      `💰 [SQUARE] Product ${productId}: Square price = ${productPrice} cents ($${(productPrice / 100).toFixed(2)})`,
    );

    return {
      id: productId,
      name: itemData?.name || "Unnamed Product",
      description: itemData?.description || "",
      price: productPrice, // Square stores prices in cents
      currency: priceMoney?.currency?.toLowerCase() || "usd",
      category: itemData?.category_id || "uncategorized",
      stock: 100,
      availability: "available",
      // availability: itemData?.available_for_booking ? "available" : "unavailable",
      brand: itemData?.brand || "Square Store",
      sku: firstVariation?.item_variation_data?.sku || item.id,
      images: images,
      attributes: {
        product_type: "square_product",
        condition: "new",
        features: itemData?.description ? [itemData.description] : [],
        variations: variations.map((variation: any) => ({
          id: variation.id,
          name: variation.item_variation_data?.name,
          price: variation.item_variation_data?.price_money?.amount,
          sku: variation.item_variation_data?.sku,
        })),
        square_item_id: item.id,
        square_category_id: itemData?.category_id,
      },
      platform: "square",
      rawData: item,
    };
  }
}

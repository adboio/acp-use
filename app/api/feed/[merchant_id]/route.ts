import { NextRequest, NextResponse } from "next/server";
import { oauthManager } from "@/lib/oauth/manager";

// Product Feed for ACP - E-commerce
// This provides available products for purchase from connected platforms
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchant_id: string }> }
) {
  let products: any[] = [];
  let merchantInfo = null;

  try {
    // Get merchant ID from URL parameter
    const { merchant_id: merchantId } = await params;
    
    console.log("🤖 [FEED] Fetching products for merchant:", merchantId);
    
    // Get all connected OAuth connections for this merchant
    const connections = await oauthManager.getConnections(merchantId);
    console.log("🤖 [FEED] Found connections:", connections.length);

    // Fetch products from each connected platform
    for (const connection of connections) {
      try {
        console.log(`🤖 [FEED] Processing connection: ${connection.provider}`);
        
        const provider = oauthManager.getProvider(connection.provider as any);
        if (!provider || !provider.getProducts) {
          console.log(`🤖 [FEED] Provider ${connection.provider} doesn't support product fetching`);
          continue;
        }

        // Check if token is expired and refresh if needed
        let accessToken = connection.tokens.accessToken;
        if (connection.tokens.expiresAt && connection.tokens.expiresAt < new Date()) {
          console.log(`🤖 [FEED] Token expired for ${connection.provider}, refreshing...`);
          const refreshedConnection = await oauthManager.refreshConnection(connection.id);
          accessToken = refreshedConnection.tokens.accessToken;
        }

        // Fetch products from this provider
        const providerProducts = await provider.getProducts(accessToken);
        console.log(`🤖 [FEED] Fetched ${providerProducts.length} products from ${connection.provider}`);
        
        products.push(...providerProducts);

        // Use the first connection's merchant info for the feed metadata
        if (!merchantInfo && connection.userInfo) {
          merchantInfo = {
            id: connection.merchantId,
            name: connection.userInfo.name || "Connected Store",
            description: `Products from ${connection.provider}`,
            platform: connection.provider,
          };
        }
      } catch (error) {
        console.error(`🤖 [FEED] Error fetching products from ${connection.provider}:`, error);
        // Continue with other connections even if one fails
      }
    }

    // If no products were found from connected platforms, use mock data
    if (products.length === 0) {
      console.log("🤖 [FEED] No products found from connected platforms, using mock data");
      products = [
        {
          id: "product_laptop_001",
          name: "MacBook Pro 14-inch",
          description: "Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD",
          price: 199900, // $1999.00 in cents
          currency: "usd",
          category: "electronics",
          stock: 15,
          availability: "available",
          brand: "Apple",
          sku: "MBP14-M3-512",
          images: [
            {
              url: "https://via.placeholder.com/300x300?text=MacBook+Pro",
              alt: "MacBook Pro 14-inch",
            },
          ],
          attributes: {
            product_type: "laptop",
            condition: "new",
            features: ["M3 Chip", "16GB RAM", "512GB SSD", "14-inch Display"],
            weight: "3.5 lbs",
            dimensions: "12.3 x 8.7 x 0.6 inches",
          },
        },
        {
          id: "product_headphones_001",
          name: "Sony WH-1000XM5 Headphones",
          description: "Industry-leading noise canceling wireless headphones",
          price: 39900, // $399.00 in cents
          currency: "usd",
          category: "electronics",
          stock: 8,
          availability: "available",
          brand: "Sony",
          sku: "WH1000XM5-BLK",
          images: [
            {
              url: "https://via.placeholder.com/300x300?text=Sony+Headphones",
              alt: "Sony WH-1000XM5 Headphones",
            },
          ],
          attributes: {
            product_type: "headphones",
            condition: "new",
            features: [
              "Noise Canceling",
              "30hr Battery",
              "Quick Charge",
              "Bluetooth 5.2",
            ],
            weight: "0.6 lbs",
            color: "Black",
          },
        },
      ];
    }

    // Set default merchant info if none was found
    if (!merchantInfo) {
      merchantInfo = {
        id: "merchant_store_001",
        name: "Tech & Style Store",
        description: "Premium electronics, clothing, and lifestyle products",
        platform: "mock",
      };
    }
  } catch (error) {
    console.error("🤖 [FEED] Error in feed generation:", error);
    // Return empty feed on error
    products = [];
    merchantInfo = {
      id: "error",
      name: "Error",
      description: "Unable to load products",
      platform: "error",
    };
  }

  // Generate shipping options
  const generateShippingOptions = () => {
    return [
      {
        id: "shipping_standard",
        name: "Standard Shipping",
        description: "5-7 business days",
        price: 599, // $5.99 in cents
        estimated_days: "5-7",
        carrier: "USPS",
      },
      {
        id: "shipping_expedited",
        name: "Expedited Shipping",
        description: "2-3 business days",
        price: 1299, // $12.99 in cents
        estimated_days: "2-3",
        carrier: "FedEx",
      },
      {
        id: "shipping_overnight",
        name: "Overnight Shipping",
        description: "Next business day",
        price: 2499, // $24.99 in cents
        estimated_days: "1",
        carrier: "FedEx",
      },
    ];
  };

  const shippingOptions = generateShippingOptions();

  const feed = {
    version: "1.0",
    merchant: {
      id: merchantInfo.id,
      name: merchantInfo.name,
      description: merchantInfo.description,
      website: merchantInfo.platform === "square" ? "https://squareup.com" : "https://example.com",
      logo: "https://via.placeholder.com/100x100?text=Store",
      address: "Connected Store",
      phone: "N/A",
      platform: merchantInfo.platform,
    },
    products,
    shipping_options: shippingOptions,
    last_updated: new Date().toISOString(),
    categories: [
      {
        id: "electronics",
        name: "Electronics",
        description: "Laptops, headphones, and tech accessories",
      },
      {
        id: "clothing",
        name: "Clothing",
        description: "Apparel and accessories",
      },
      {
        id: "food",
        name: "Food & Beverages",
        description: "Coffee, snacks, and gourmet items",
      },
    ],
    fulfillment_options: shippingOptions.map((option) => ({
      id: option.id,
      type: "shipping",
      title: option.name,
      description: option.description,
      price: option.price,
      subtotal: 0,
      tax: 0,
      total: 0,
      metadata: {
        carrier: option.carrier,
        estimated_days: option.estimated_days,
      },
    })),
  };

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching for development
    },
  });
}

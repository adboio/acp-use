import { NextResponse } from "next/server";

// Mock Product Feed for ACP - E-commerce
// This provides available products for purchase
export async function GET() {
  const products = [
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
    {
      id: "product_tshirt_001",
      name: "Premium Cotton T-Shirt",
      description: "100% organic cotton t-shirt in various colors",
      price: 2900, // $29.00 in cents
      currency: "usd",
      category: "clothing",
      stock: 50,
      availability: "available",
      brand: "EcoWear",
      sku: "TSH-ORG-001",
      images: [
        {
          url: "https://via.placeholder.com/300x300?text=Cotton+T-Shirt",
          alt: "Premium Cotton T-Shirt",
        },
      ],
      attributes: {
        product_type: "clothing",
        condition: "new",
        features: ["100% Organic Cotton", "Pre-shrunk", "Machine Washable"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Navy", "Gray"],
      },
    },
    {
      id: "product_coffee_001",
      name: "Artisan Coffee Beans",
      description: "Single-origin Ethiopian coffee beans, medium roast",
      price: 1800, // $18.00 in cents
      currency: "usd",
      category: "food",
      stock: 25,
      availability: "available",
      brand: "Mountain Peak Coffee",
      sku: "COF-ETH-001",
      images: [
        {
          url: "https://via.placeholder.com/300x300?text=Coffee+Beans",
          alt: "Artisan Coffee Beans",
        },
      ],
      attributes: {
        product_type: "coffee",
        condition: "new",
        features: ["Single Origin", "Medium Roast", "Fair Trade", "12oz Bag"],
        roast_level: "Medium",
        origin: "Ethiopia",
      },
    },
  ];

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
      id: "merchant_store_001",
      name: "Tech & Style Store",
      description: "Premium electronics, clothing, and lifestyle products",
      website: "https://techandstyle.com",
      logo: "https://via.placeholder.com/100x100?text=Store",
      address: "456 Commerce St, Downtown, City 12345",
      phone: "(555) 987-6543",
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
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
    },
  });
}

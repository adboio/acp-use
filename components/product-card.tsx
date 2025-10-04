"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    stock?: number;
    availability?: string;
    brand?: string;
    images?: Array<{ url: string; alt: string }>;
    attributes?: {
      condition?: string;
      features?: string[];
      weight?: string;
      color?: string;
    };
  };
  onAddToCart?: (productId: string) => void;
  onBuyNow?: (productId: string, productName: string) => void;
  showAddToCart?: boolean;
  showBuyNow?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  showAddToCart = true,
  showBuyNow = true,
}: ProductCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "used":
        return "bg-orange-100 text-orange-800";
      case "refurbished":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden mb-4">
      <div className="flex min-h-36">
        {/* Product Image */}
        <div className="relative w-36 h-36 flex-shrink-0 overflow-hidden pt-3 pl-3">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 pb-5 flex flex-col justify-between min-w-0">
          <div className="flex-1">
            {/* Header with Brand, Name, and Stock Badge */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                {/* Brand */}
                {product.brand && (
                  <p className="text-xs text-gray-500 mb-1 truncate">
                    {product.brand}
                  </p>
                )}
                {/* Product Name */}
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
              </div>
              {/* Stock Badge */}
              {product.stock !== undefined && (
                <Badge
                  className={`text-xs ml-2 flex-shrink-0 ${getAvailabilityColor(product.availability || "available")}`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Price and Condition */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.attributes?.condition && (
                <Badge
                  className={`text-xs flex-shrink-0 ${getConditionColor(product.attributes.condition)}`}
                >
                  {product.attributes.condition}
                </Badge>
              )}
            </div>

            {/* Features */}
            {product.attributes?.features &&
              product.attributes.features.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {product.attributes.features
                      .slice(0, 2)
                      .map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    {product.attributes.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.attributes.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 flex-shrink-0">
            {/* Buy Now Button */}
            {showBuyNow && onBuyNow && (
              <Button
                onClick={() => onBuyNow(product.id, product.name)}
                className="flex-1"
                size="sm"
                disabled={
                  product.stock === 0 || product.availability === "out of stock"
                }
              >
                {product.stock === 0 || product.availability === "out of stock"
                  ? "Out of Stock"
                  : "Buy Now"}
              </Button>
            )}

            {/* Add to Cart Button */}
            {showAddToCart && onAddToCart && (
              <Button
                onClick={() => onAddToCart(product.id)}
                variant="outline"
                size="sm"
                disabled={
                  product.stock === 0 || product.availability === "out of stock"
                }
                className="flex-shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

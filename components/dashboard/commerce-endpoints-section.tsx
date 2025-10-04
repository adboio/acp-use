"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Globe, ShoppingCart } from "lucide-react";

interface CommerceEndpointsSectionProps {
  merchantId: string;
  baseUrl: string;
}

export function CommerceEndpointsSection({ merchantId, baseUrl }: CommerceEndpointsSectionProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const productFeedUrl = `${baseUrl}/api/feed/${merchantId}`;
  const checkoutSessionsUrl = `${baseUrl}/api/acp/merchants/${merchantId}/checkout_sessions`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const EndpointCard = ({ 
    title, 
    description, 
    url, 
    field, 
    icon: Icon 
  }: {
    title: string;
    description: string;
    url: string;
    field: string;
    icon: any;
  }) => (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center space-x-2">
        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-800 break-all">
          {url}
        </code>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(url, field)}
          className="shrink-0"
        >
          {copiedField === field ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="mb-8 border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <CardTitle className="text-lg text-green-800">Setup Complete</CardTitle>
              <CardDescription className="text-green-700">
                Give these URLs to your AI agent (like ChatGPT) and customers will instantly be able to discover and purchase your products.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">How to Use These Endpoints</h4>
                <p className="text-sm text-blue-800">
                  Copy these URLs and send them to your AI agent (ChatGPT, Claude, etc.) along with instructions to:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Use the product feed to browse your available products</li>
                  <li>Create checkout sessions when customers want to make purchases</li>
                  <li>Handle the complete payment flow for your customers</li>
                </ul>
              </div>
            </div>
          </div> */}

          <div className="space-y-4">
            <EndpointCard
              title="Product Feed"
              description="Get all your available products with pricing, inventory, and details"
              url={productFeedUrl}
              field="feed"
              icon={Globe}
            />

            <EndpointCard
              title="Checkout Sessions"
              description="Create and manage checkout sessions for customer purchases"
              url={checkoutSessionsUrl}
              field="checkout"
              icon={ShoppingCart}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

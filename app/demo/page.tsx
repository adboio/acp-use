"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CheckoutUI from "@/components/checkout-ui";
import ProductCard from "@/components/product-card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  checkoutSession?: any;
  showCheckout?: boolean;
  isCompletingPayment?: boolean;
  products?: any[];
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  // Square image ID to local image mapping
  const squareImageMapping: Record<string, string> = {
    square_4ASJKQLTJROKY4BOF6EMSNAE: "/supabase.jpeg",
    square_G4C7H6MMPA3ZBGPEYJ726H2G: "/datadog.png",
    square_4WCWAQHGXCACN5GJTM63FJIL: "/figma.png",
    square_IXJGYW3DEE5I6GIX4KFCJ2HC: "/snap.png",
    square_Y3BLHAXMLJDW54UUEZHB76J7: "/yc.png",
  };

  // Function to map product images
  const mapProductImages = (products: any[]) => {
    return products.map((product) => {
      const mappedImage = squareImageMapping[product.id];
      if (mappedImage) {
        return {
          ...product,
          images: [
            {
              url: mappedImage,
              alt: product.name || "Product image",
            },
          ],
        };
      }
      return product;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize with welcome message on client side only
    if (!isInitialized) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      setIsInitialized(true);
    }
    scrollToBottom();
  }, [isInitialized]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${++messageIdCounter.current}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    addMessage({
      role: "user",
      content: userMessage,
    });

    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        addMessage({
          role: "assistant",
          content: `Error: ${data.error}`,
        });
      } else {
        // Check if we have a checkout session that needs payment
        if (data.session && data.session.status === "ready_for_payment") {
          addMessage({
            role: "assistant",
            content: data.content,
            checkoutSession: data.session,
            showCheckout: true,
            products: data.products || [],
          });
        } else {
          addMessage({
            role: "assistant",
            content: data.content,
            products: data.products || [],
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
      });
    }

    setIsLoading(false);
  };

  const handlePaymentComplete = async (
    sharedPaymentToken: string,
    messageId: string,
  ) => {
    console.log(
      "💳 [PAYMENT] Payment completed with token:",
      sharedPaymentToken,
    );

    // Show loading state on the checkout message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isCompletingPayment: true, showCheckout: false }
          : msg,
      ),
    );

    try {
      // Complete the checkout with the shared payment token
      const checkoutSessionId = messages.find((m) => m.id === messageId)
        ?.checkoutSession?.id;

      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: `Complete my payment for checkout session ${checkoutSessionId} with payment token ${sharedPaymentToken}`,
            },
          ],
        }),
      });

      const data = await response.json();

      // Remove loading state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isCompletingPayment: false } : msg,
        ),
      );

      if (data.error) {
        addMessage({
          role: "assistant",
          content: `Payment error: ${data.error}`,
        });
      } else {
        addMessage({
          role: "assistant",
          content: data.content,
        });
      }
    } catch (error) {
      console.error("Payment completion error:", error);

      // Remove loading state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isCompletingPayment: false } : msg,
        ),
      );

      addMessage({
        role: "assistant",
        content:
          "I'm sorry, there was an error completing your payment. Please try again.",
      });
    }
  };

  const handlePaymentCancel = (messageId: string) => {
    console.log("💳 [PAYMENT] Payment cancelled for message:", messageId);

    // Update the message to hide checkout
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, showCheckout: false } : msg,
      ),
    );
  };

  const handleBuyNow = async (productId: string, productName: string) => {
    console.log("🛒 [BUY NOW] Buying product:", productId, productName);

    // Add user message
    addMessage({
      role: "user",
      content: `I want to buy the ${productName}`,
    });

    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: `I want to buy the ${productName}` },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        addMessage({
          role: "assistant",
          content: `Error: ${data.error}`,
        });
      } else {
        // Check if we have a checkout session that needs payment
        if (data.session && data.session.status === "ready_for_payment") {
          addMessage({
            role: "assistant",
            content: data.content,
            checkoutSession: data.session,
            showCheckout: true,
            products: data.products || [],
          });
        } else {
          addMessage({
            role: "assistant",
            content: data.content,
            products: data.products || [],
          });
        }
      }
    } catch (error) {
      console.error("Buy now error:", error);
      addMessage({
        role: "assistant",
        content:
          "I'm sorry, I encountered an error processing your purchase. Please try again.",
      });
    }

    setIsLoading(false);
  };

  // Don't render until initialized to prevent hydration issues
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full border-b border-gray-200 h-16 bg-white">
        <div className="mx-auto max-w-4xl h-full flex items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            acp-use
          </Link>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* Message Bubble */}
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Checkout UI */}
                  {message.showCheckout && message.checkoutSession && (
                    <div className="mt-4 w-full">
                      <CheckoutUI
                        checkoutSession={message.checkoutSession}
                        onComplete={(token) =>
                          handlePaymentComplete(token, message.id)
                        }
                        onCancel={() => handlePaymentCancel(message.id)}
                      />
                    </div>
                  )}

                  {/* Payment Completion Loading State */}
                  {message.isCompletingPayment && (
                    <div className="mt-4 w-full">
                      <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                          <p className="text-sm text-blue-700 font-medium">
                            Completing your payment...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Display - Outside message bubble */}
              {message.products && message.products.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] w-full">
                    <div className="space-y-2">
                      {mapProductImages(message.products).map(
                        (product, index) => (
                          <ProductCard
                            key={product.id || index}
                            product={product}
                            onBuyNow={handleBuyNow}
                            showAddToCart={false}
                            showBuyNow={true}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to show products or help you shop..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

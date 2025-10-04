"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CheckoutUI from "@/components/checkout-ui";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  checkoutSession?: any;
  showCheckout?: boolean;
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
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
          });
        } else {
          addMessage({
            role: "assistant",
            content: data.content,
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

    try {
      // Complete the checkout with the shared payment token
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: "Complete my payment" },
            {
              role: "assistant",
              content: "I'll complete your payment now.",
              toolCalls: [
                {
                  name: "complete_checkout",
                  args: {
                    session_id: messages.find((m) => m.id === messageId)
                      ?.checkoutSession?.id,
                    shared_payment_token: sharedPaymentToken,
                  },
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

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
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Checkout UI */}
                {message.showCheckout && message.checkoutSession && (
                  <div className="mt-4">
                    <CheckoutUI
                      checkoutSession={message.checkoutSession}
                      onComplete={(token) =>
                        handlePaymentComplete(token, message.id)
                      }
                      onCancel={() => handlePaymentCancel(message.id)}
                    />
                  </div>
                )}
              </div>
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

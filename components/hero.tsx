"use client";

import { RotatingText } from "@/components/ui/shadcn-io/rotating-text";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const platforms = ["ChatGPT", "Claude", "Grok", "Gemini", "AI agents"];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* YC Badge */}
            {/* <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
                <div className="flex items-center gap-2">
                  <span>Backed by</span>
                  <img
                    src="/YCLogoOrange.svg"
                    alt="Y Combinator"
                    className="h-4"
                  />
                  <span>(soon?)</span>
                </div>
              </div>
            </div> */}

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                <div className="whitespace-nowrap">Get more customers</div>
                <div className="whitespace-nowrap">
                  from{" "}
                  <span className="inline-block">
                    <RotatingText
                      text={platforms}
                      duration={3000}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="bg-gradient-to-b from-cyan-400 via-blue-600 to-indigo-800 bg-clip-text text-transparent font-bold"
                    />
                  </span>
                </div>
              </h1>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-600">
                Drive discovery &amp; sales directly from AI chat
              </h2>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-50 text-green-700 border-green-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>100% FREE for Merchants</span>
                  </div>
                </Badge>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/auth/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Get started
              </a>
              <a
                href="/demo"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-300 px-8 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Try it now
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No code required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Works with any e-commerce platform</span>
              </div>
            </div>
          </div>

          {/* Right Column - Demo Chat Window */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        AI
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">ChatGPT</h3>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 h-96 overflow-y-auto">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
                      <p className="text-sm">I need a gift for my girlfriend</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        I&apos;d love to help! What&apos;s your budget and what
                        does she like? I can suggest some thoughtful options.
                      </p>
                    </div>
                  </div>

                  {/* User Follow-up */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        Around $50, she loves coffee and fashion
                      </p>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        Perfect! Here are some great options:
                      </p>
                    </div>
                  </div>

                  {/* Product Card */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">☕</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Artisan Coffee Beans
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Single-origin Ethiopian, medium roast
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>⭐ 4.8</span>
                          <span>•</span>
                          <span>25 in stock</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Price: $18.00</span>
                            <div className="flex gap-2 mt-1">
                              <span className="bg-white px-2 py-1 rounded text-xs">
                                Fair Trade
                              </span>
                              <span className="bg-white px-2 py-1 rounded text-xs">
                                Gift Ready
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Payment Prompt */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        Perfect! I&apos;ll set this up for you. Just enter your
                        payment details below:
                      </p>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="text-sm font-medium text-gray-900">
                      Payment Details
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Card number"
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Email for receipt"
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                    </div>
                    <button className="w-full bg-pink-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors">
                      Complete Purchase - $18.00
                    </button>
                  </div>

                  {/* Success Message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-sm text-green-800 font-medium">
                        Gift purchased! Receipt sent to your email.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                    <button
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                      disabled
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

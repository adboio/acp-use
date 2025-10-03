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
            <div className="flex justify-start">
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
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                Get more bookings from{" "}
                <span className="inline-block">
                  <RotatingText
                    text={platforms}
                    duration={3000}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-gradient-to-b from-cyan-400 via-blue-600 to-indigo-800 bg-clip-text text-transparent font-bold"
                  />
                </span>
              </h1>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-600">
                Let your customers book appointments directly inside AI chat
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
                href="mailto:founders@acp-use.com?subject=ACP%20Adapter%20Demo"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Get started
              </a>
              <a
                href="https://developers.openai.com/commerce/specs/checkout"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-300 px-8 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                How it works
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
                <span>Works with any booking system</span>
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
                      <p className="text-sm">
                        I need a haircut in Seattle tomorrow
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        I found some great salons in Seattle! Here are your
                        options:
                      </p>
                    </div>
                  </div>

                  {/* Booking Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">✂️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Style Studio Seattle
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Professional haircuts & styling
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>⭐ 4.8</span>
                          <span>•</span>
                          <span>2.1 miles away</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">
                              Available tomorrow:
                            </span>
                            <div className="flex gap-2 mt-1">
                              <span className="bg-white px-2 py-1 rounded text-xs">
                                2:00 PM
                              </span>
                              <span className="bg-white px-2 py-1 rounded text-xs">
                                3:30 PM
                              </span>
                              <span className="bg-white px-2 py-1 rounded text-xs">
                                5:00 PM
                              </span>
                            </div>
                          </div>
                          <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Confirmation */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
                      <p className="text-sm">Perfect! Book me for 3:30 PM</p>
                    </div>
                  </div>

                  {/* AI Confirmation */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        Great! I&apos;ve booked your appointment at Style Studio
                        Seattle for tomorrow at 3:30 PM. You&apos;ll receive a
                        confirmation email shortly.
                      </p>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-sm text-green-800 font-medium">
                        Appointment confirmed!
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

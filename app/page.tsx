import { Hero } from "@/components/hero";
import { GridBackground } from "@/components/grid-background";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/30 relative">
      {/* Grid Background */}
      <GridBackground />
      {/* Navigation */}
      <nav className="relative w-full border-b border-gray-200/50 h-16 z-10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-gray-900">
            acp-use
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="https://developers.openai.com/commerce/specs/checkout"
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ACP Spec
            </a>
            <a
              href="mailto:founders@acp-use.com?subject=ACP%20Adapter%20Demo"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <Hero />
        </div>
      </div>

      {/* Visual Diagram Section */}
      <div className="relative py-20 z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Universal Adapter
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We connect any booking system to any AI platform. One integration,
              infinite possibilities.
            </p>
          </div>

          <div className="flex justify-center">
            <IntegrationDiagram />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works for your business
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect your existing booking system once, and suddenly your
              salon, gym, or clinic becomes bookable through AI. No technical
              knowledge required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Connect Any System"
              description="Works with Square, Mindbody, Acuity, or any booking platform. We handle all the technical integration behind the scenes."
              icon="🔌"
            />
            <FeatureCard
              title="Get Paid Directly"
              description="All payments flow through your existing payment processor. We never touch your money, just make the connection."
              icon="💳"
            />
            <FeatureCard
              title="Appear in AI Results"
              description="When customers ask AI for services in your area, your business shows up as a bookable option instantly."
              icon="🤖"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-blue-600 py-20 z-10">
        <div className="mx-auto max-w-4xl text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get more bookings through AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect your existing booking system and start getting bookings from
            ChatGPT, Claude, and other AI platforms today.
          </p>
          <a
            href="mailto:founders@acp-use.com?subject=ACP%20Adapter%20Demo"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-blue-600 hover:bg-gray-50 transition-colors"
          >
            Book a Demo
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-sm border-t border-gray-200/50 z-10">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} acp-use, Inc. All rights reserved.
            </p>
            {/* <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="https://mcp-use.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
                MCP-Use
              </a>
              <a href="https://usebear.ai" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
                Bear AI
              </a>
              <a href="https://knowlify.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
                Knowlify
              </a>
            </div> */}
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-200/50">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function IntegrationDiagram() {
  return (
    <div className="flex items-center justify-center space-x-8 max-w-5xl mx-auto">
      {/* Booking Systems */}
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
            <div className="text-xl">📱</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">Square</div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
            <div className="text-xl">💪</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">Mindbody</div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
            <div className="text-xl">📅</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">Acuity</div>
        </div>
      </div>

      {/* Arrow 1 */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-0.5 bg-blue-500"></div>
        <div className="text-blue-500 text-2xl">→</div>
      </div>

      {/* Central Adapter */}
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
        <div className="text-center text-white">
          <div className="text-lg font-bold">ACP</div>
          <div className="text-xs opacity-90">Adapter</div>
        </div>
      </div>

      {/* Arrow 2 */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-0.5 bg-green-500"></div>
        <div className="text-green-500 text-2xl">→</div>
      </div>

      {/* AI Platforms */}
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
            <div className="text-xl">🤖</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">ChatGPT</div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
            <div className="text-xl">🧠</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">Claude</div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
            <div className="text-xl">⚡</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">Grok</div>
        </div>
      </div>
    </div>
  );
}

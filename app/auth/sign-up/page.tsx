import { SignUpForm } from "@/components/sign-up-form";
import { GridBackground } from "@/components/grid-background";
import Link from "next/link";

export default function Page() {
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
            <Link
              href="/demo"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Live Demo
            </Link>
            <Link
              href="/#how-it-works"
              rel="noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}

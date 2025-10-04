import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SimpleConnectionsSection } from "@/components/dashboard/simple-connections-section";
import { SimpleStripeSection } from "@/components/dashboard/simple-stripe-section";
import { AnalyticsSection } from "@/components/dashboard/analytics-section";
import { SetupStepsChecklist } from "@/components/dashboard/setup-steps-checklist";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get the merchant ID for the current user
  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (merchantError || !merchant) {
    // Handle case where user doesn't have a merchant account
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Merchant Account Required</h1>
          <p className="text-gray-600 mb-8">
            You need to set up a merchant account before accessing the dashboard.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Set up Merchant Account
          </button>
        </div>
      </main>
    );
  }

  const merchantId = merchant.id;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Setup Steps Checklist */}
          <SetupStepsChecklist merchantId={merchantId} />
          
          {/* Main Content - Simplified */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Simple Connections */}
            <SimpleConnectionsSection merchantId={merchantId} />
            
            {/* Simple Stripe Button */}
            <SimpleStripeSection merchantId={merchantId} />
          </div>
          
          {/* Analytics Below */}
          <AnalyticsSection />
        </div>
    </main>
  );
}

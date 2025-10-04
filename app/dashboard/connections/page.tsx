import { ConnectionManager } from "@/components/oauth/connection-manager";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ConnectionsPage() {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Account Connections</h1>
            <p className="text-gray-600 mt-2">
              You need to set up a merchant account before connecting
              integrations.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const merchantId = merchant.id;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account Connections</h1>
          <p className="text-gray-600 mt-2">
            Connect your accounts to enable integrations and data
            synchronization.
          </p>
        </div>

        <ConnectionManager merchantId={merchantId} />
      </div>
    </main>
  );
}

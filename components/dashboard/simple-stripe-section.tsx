"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface SimpleStripeSectionProps {
  merchantId: string;
}

export function SimpleStripeSection({ }: SimpleStripeSectionProps) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [missingCount, setMissingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<"create" | "onboard" | "dashboard" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch Stripe connected account status
        const statusRes = await fetch("/api/stripe/account-status", {
          method: "GET",
        });
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          setConnected(Boolean(statusJson.connected));
          setOnboardingComplete(Boolean(statusJson.onboarding_complete));
          setMissingCount(Number(statusJson.missing_information_count || 0));
        }
      } catch (e) {
        console.error("Failed to load Stripe status:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createConnectedAccount = async () => {
    try {
      setPending("create");
      const res = await fetch("/api/stripe/create-connected-account", {
        method: "POST",
      });
      const json = await res.json();
      if (json.account) {
        setConnected(true);
      } else if (json.error) {
        throw new Error(json.error);
      }
    } catch (e) {
      console.error("Could not create connected account:", e);
    } finally {
      setPending(null);
    }
  };

  const startOnboarding = async () => {
    try {
      setPending("onboard");
      const res = await fetch("/api/stripe/account-link", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else if (json.error) {
        throw new Error(json.error);
      }
    } catch (e) {
      console.error("Could not start onboarding:", e);
      setPending(null);
    }
  };

  const openStripeDashboard = async () => {
    try {
      setPending("dashboard");
      const res = await fetch("/api/stripe/login-link", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else if (json.error) {
        throw new Error(json.error);
      }
    } catch (e) {
      console.error("Could not open dashboard:", e);
      setPending(null);
    }
  };

  const getStatusBadge = () => {
    if (connected === true && !onboardingComplete) {
      return (
        <Badge variant="destructive">
          {missingCount > 0
            ? `${missingCount} action${missingCount === 1 ? "" : "s"} required`
            : "Onboarding incomplete"}
        </Badge>
      );
    }
    if (connected === true && onboardingComplete) {
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-600/90">
          Onboarding complete
        </Badge>
      );
    }
    return <Badge variant="outline">Not Connected</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Processing
            </CardTitle>
            <CardDescription>
              Accept payments with Stripe
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {connected === false && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Stripe</h3>
            <p className="text-gray-600 mb-6">Set up payment processing to accept payments from your customers</p>
            <Button 
              onClick={createConnectedAccount} 
              disabled={pending !== null}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {pending === "create" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create connected account
                </>
              )}
            </Button>
          </div>
        )}

        {connected === true && !onboardingComplete && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Onboarding</h3>
            <p className="text-gray-600 mb-4">
              {missingCount > 0
                ? `You have ${missingCount} required action${missingCount === 1 ? "" : "s"} to complete.`
                : "Please complete the Stripe onboarding process to enable payments and payouts."}
            </p>
            <Button 
              onClick={startOnboarding} 
              disabled={pending !== null}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {pending === "onboard" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Complete onboarding / Update details"
              )}
            </Button>
          </div>
        )}

        {connected === true && onboardingComplete && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Stripe Connected!</h3>
            <p className="text-gray-600 mb-4">Your payment processing is now active.</p>
            <Button 
              onClick={openStripeDashboard} 
              disabled={pending !== null}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {pending === "dashboard" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                "Open Stripe dashboard"
              )}
            </Button>
          </div>
        )}

        {connected === null && loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading Stripe status...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

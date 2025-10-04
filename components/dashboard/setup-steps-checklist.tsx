"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { OAuthConnection } from "@/lib/oauth/types";
import Link from "next/link";
import { CommerceEndpointsSection } from "./commerce-endpoints-section";

interface SetupStepsChecklistProps {
  merchantId: string;
}

interface StripeStatus {
  connected: boolean;
  onboarding_complete: boolean;
  missing_information_count: number;
}

export function SetupStepsChecklist({ merchantId }: SetupStepsChecklistProps) {
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<"create" | "onboard" | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch connections
      const connectionsRes = await fetch(
        `/api/oauth/connections?merchant_id=${merchantId}`,
      );
      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData.connections);
      }

      // Fetch Stripe status
      const stripeRes = await fetch("/api/stripe/account-status");
      if (stripeRes.ok) {
        const stripeData = await stripeRes.json();
        setStripeStatus(stripeData);
      }
    } catch (err) {
      console.error("Failed to fetch setup data:", err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchData();
  }, [merchantId, fetchData]);

  const createConnectedAccount = async () => {
    try {
      setPending("create");
      const res = await fetch("/api/stripe/create-connected-account", {
        method: "POST",
      });
      const json = await res.json();
      if (json.account) {
        setStripeStatus((prev) =>
          prev
            ? { ...prev, connected: true }
            : {
                connected: true,
                onboarding_complete: false,
                missing_information_count: 0,
              },
        );
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
      }
    } catch (e) {
      console.error("Could not start onboarding:", e);
      setPending(null);
    }
  };

  const connectedPlatforms = connections.filter(
    (c) => c.status === "connected",
  ).length;
  const hasConnectedPlatform = connectedPlatforms > 0;
  const isStripeConnected = stripeStatus?.connected || false;
  const isStripeOnboarded = stripeStatus?.onboarding_complete || false;
  const isSetupComplete = hasConnectedPlatform && isStripeOnboarded;

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-gray-600">Loading setup status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSetupComplete) {
    return (
      <CommerceEndpointsSection
        merchantId={merchantId}
        baseUrl="https://www.acp-use.com"
      />
    );
  }

  return (
    <Card className="mb-8 border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-amber-800">
              Complete Your Setup
            </CardTitle>
            <CardDescription className="text-amber-700">
              Finish these steps to start accepting payments and managing your
              business.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-300 text-amber-800">
            {isSetupComplete ? "Complete" : "In Progress"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Step 1: Connect a Platform */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center">
              {hasConnectedPlatform ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-3" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  Connect a Platform
                </div>
                <div className="text-sm text-gray-600">
                  {hasConnectedPlatform
                    ? `${connectedPlatforms} platform${connectedPlatforms === 1 ? "" : "s"} connected`
                    : "Connect Square, Gumroad, or Wix to sync your products and orders"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasConnectedPlatform ? (
                <Badge className="bg-green-600 text-white">Complete</Badge>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/dashboard/connections">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Connect Platform
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Complete Stripe Onboarding */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center">
              {isStripeOnboarded ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-3" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  Complete Stripe Onboarding
                </div>
                <div className="text-sm text-gray-600">
                  {isStripeOnboarded
                    ? "Payment processing is active and ready"
                    : isStripeConnected
                      ? "Complete your Stripe account setup to accept payments"
                      : "Set up Stripe to process payments and receive payouts"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isStripeOnboarded ? (
                <Badge className="bg-green-600 text-white">Complete</Badge>
              ) : isStripeConnected ? (
                <Button
                  size="sm"
                  onClick={startOnboarding}
                  disabled={pending !== null}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {pending === "onboard" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-1" />
                      Complete Setup
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={createConnectedAccount}
                  disabled={pending !== null}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {pending === "create" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-1" />
                      Connect Stripe
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

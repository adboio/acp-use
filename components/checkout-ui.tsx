"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface CheckoutUIProps {
  checkoutSession: any;
  onComplete: (sharedPaymentToken: string) => void;
  onCancel: () => void;
}

function CheckoutForm({
  checkoutSession,
  onComplete,
  onCancel,
}: CheckoutUIProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "collecting" | "processing" | "completed" | "error"
  >("collecting");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus("processing");

    try {
      // Create SetupIntent to collect payment method
      const response = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_email: checkoutSession.contact?.email,
          amount:
            checkoutSession.totals?.find((t: any) => t.type === "total")
              ?.amount || 0,
          currency: checkoutSession.currency || "usd",
        }),
      });

      const { client_secret } = await response.json();

      if (!client_secret) {
        throw new Error("Failed to create setup intent");
      }

      // Confirm the setup
      const result = await stripe.confirmSetup({
        elements,
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/demo`,
        },
      });

      if (result.error) {
        throw result.error;
      }

      // Type assertion since we know setupIntent exists when no error
      const setupIntent = (result as any).setupIntent;
      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error("SetupIntent confirmation failed");
      }

      // Create Shared Payment Token
      const tokenResponse = await fetch(
        "/api/stripe/create-shared-payment-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            setup_intent_id: setupIntent.id,
            amount:
              checkoutSession.totals?.find((t: any) => t.type === "total")
                ?.amount || 0,
            currency: checkoutSession.currency || "usd",
          }),
        },
      );

      const { shared_payment_token } = await tokenResponse.json();

      if (!shared_payment_token) {
        throw new Error("Failed to create shared payment token");
      }

      setStatus("completed");
      onComplete(shared_payment_token);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Payment failed");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string | undefined) => {
    const safeCurrency = currency || "usd";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency.toUpperCase(),
    }).format(amount / 100);
  };

  const totalAmount =
    checkoutSession?.totals?.find((t: any) => t.type === "total")?.amount || 0;
  const currency = checkoutSession?.currency || "usd";

  if (status === "completed") {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Payment Successful!
          </h3>
          <p className="text-sm text-gray-600">
            Your order has been confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>Secure payment powered by Stripe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            {checkoutSession.line_items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.item?.id || "Service"}</span>
                <span>{formatPrice(item.total, currency)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-lg">
              <PaymentElement
                options={{
                  layout: "tabs",
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || !elements || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(totalAmount, currency)}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CheckoutUI({
  checkoutSession,
  onComplete,
  onCancel,
}: CheckoutUIProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Only create SetupIntent if checkoutSession is available
    if (!checkoutSession) {
      return;
    }

    // Create SetupIntent when component mounts
    const createSetupIntent = async () => {
      try {
        const response = await fetch("/api/stripe/create-setup-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_email: checkoutSession?.contact?.email,
            amount:
              checkoutSession?.totals?.find((t: any) => t.type === "total")
                ?.amount || 0,
            currency: checkoutSession?.currency || "usd",
          }),
        });

        const { client_secret } = await response.json();
        setClientSecret(client_secret);
      } catch (error) {
        console.error("Failed to create setup intent:", error);
      }
    };

    createSetupIntent();
  }, [checkoutSession]);

  // Early return if checkoutSession is not available
  if (!checkoutSession) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Checkout Error
          </h3>
          <p className="text-sm text-gray-600">
            No checkout session available.
          </p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading payment form...</span>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#3b82f6",
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm
        checkoutSession={checkoutSession}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </Elements>
  );
}

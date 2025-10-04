"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OAuthConnection, OAuthProviderName } from "@/lib/oauth/types";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { SiSquare, SiGumroad, SiWix } from "@icons-pack/react-simple-icons";

interface ConnectionManagerProps {
  merchantId: string;
}

export function ConnectionManager({ merchantId }: ConnectionManagerProps) {
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/oauth/connections?merchant_id=${merchantId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();
      setConnections(data.connections);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch connections",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (provider: OAuthProviderName) => {
    const authUrl = `/api/oauth/initiate/${provider}?merchant_id=${merchantId}&return_url=${encodeURIComponent(window.location.href)}`;
    console.log("🤖 [HANDLE CONNECT] Redirecting to:", authUrl);
    window.location.href = authUrl;
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/oauth/connections?connection_id=${connectionId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to disconnect account");
      }

      await fetchConnections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect account",
      );
    }
  };

  const handleRefresh = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/oauth/refresh/${connectionId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh connection");
      }

      await fetchConnections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh connection",
      );
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [merchantId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "revoked":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isTokenExpired = (expiresAt?: Date) => {
    if (!expiresAt) return false;
    return new Date() >= expiresAt;
  };

  const getProviderIcon = (provider: OAuthProviderName) => {
    switch (provider) {
      case "square":
        return <SiSquare className="h-5 w-5" color="#00C851" />;
      case "gumroad":
        return <SiGumroad className="h-5 w-5" color="#36A9AE" />;
      case "wix":
        return <SiWix className="h-5 w-5" color="#0C6CF2" />;
      default:
        return <ExternalLink className="h-5 w-5 text-gray-600" />;
    }
  };

  const availableProviders: {
    name: OAuthProviderName;
    displayName: string;
    description: string;
  }[] = [
    {
      name: "square",
      displayName: "Square",
      description: "Payment processing and point of sale",
    },
    {
      name: "gumroad",
      displayName: "Gumroad",
      description: "Digital product sales and subscriptions",
    },
    {
      name: "wix",
      displayName: "Wix",
      description: "Website builder and e-commerce platform",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connected Accounts</h3>
        <div className="text-center py-4">Loading connections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connected Accounts</h3>
        <Button onClick={fetchConnections} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {connections.map((connection) => (
          <Card key={connection.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getProviderIcon(connection.provider as OAuthProviderName)}
                    {getStatusIcon(connection.status)}
                  </div>
                  <div>
                    <CardTitle className="text-base capitalize">
                      {connection.provider}
                    </CardTitle>
                    <CardDescription>
                      {connection.userInfo.name ||
                        connection.userInfo.email ||
                        "Connected account"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(connection.status)}>
                    {connection.status}
                  </Badge>
                  {isTokenExpired(connection.tokens.expiresAt) && (
                    <Badge variant="outline" className="text-yellow-600">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>
                    Connected:{" "}
                    {new Date(connection.createdAt).toLocaleDateString()}
                  </p>
                  {connection.tokens.expiresAt && (
                    <p>
                      Expires:{" "}
                      {new Date(
                        connection.tokens.expiresAt,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {connection.capabilities.supportsRefresh &&
                    connection.status === "connected" && (
                      <Button
                        onClick={() => handleRefresh(connection.id)}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    )}
                  <Button
                    onClick={() => handleDisconnect(connection.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {connections.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No connected accounts</p>
              <p className="text-sm text-gray-400">
                Connect your accounts to enable integrations and data
                synchronization.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Available Integrations</h4>
        <div className="grid gap-3">
          {availableProviders.map((provider) => {
            const isConnected = connections.some(
              (c) => c.provider === provider.name && c.status === "connected",
            );

            return (
              <Card
                key={provider.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getProviderIcon(provider.name)}
                      </div>
                      <div>
                        <h5 className="font-medium">{provider.displayName}</h5>
                        <p className="text-sm text-gray-600">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConnect(provider.name)}
                      disabled={isConnected}
                      variant={isConnected ? "outline" : "default"}
                      size="sm"
                    >
                      {isConnected ? "Connected" : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

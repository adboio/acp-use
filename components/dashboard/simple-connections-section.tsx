"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OAuthConnection, OAuthProviderName } from "@/lib/oauth/types";
import { CheckCircle, XCircle, Plus, ExternalLink } from "lucide-react";
import { SiSquare, SiGumroad, SiWix } from "@icons-pack/react-simple-icons";
import Link from "next/link";

interface SimpleConnectionsSectionProps {
  merchantId: string;
}

export function SimpleConnectionsSection({
  merchantId,
}: SimpleConnectionsSectionProps) {
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Failed to fetch connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (provider: OAuthProviderName) => {
    const authUrl = `/api/oauth/initiate/${provider}?merchant_id=${merchantId}&return_url=${encodeURIComponent(window.location.href)}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    fetchConnections();
  }, [merchantId]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const connectedCount = connections.filter(
    (c) => c.status === "connected",
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Connected Services</CardTitle>
            <CardDescription>
              {connectedCount} of {connections.length} services connected
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/connections">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading connections...</div>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No connections yet
            </h3>
            <p className="text-gray-600 mb-4">
              Connect your first service to get started
            </p>
            <Button
              onClick={() => handleConnect("square")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Platform
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.slice(0, 3).map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(connection.provider as OAuthProviderName)}
                  <div>
                    <div className="font-medium capitalize">
                      {connection.provider}
                    </div>
                    <div className="text-sm text-gray-600">
                      {connection.userInfo.name ||
                        connection.userInfo.email ||
                        "Connected account"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connection.status)}
                  <Badge
                    variant={
                      connection.status === "connected"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {connection.status}
                  </Badge>
                </div>
              </div>
            ))}
            {connections.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/connections">
                    View all {connections.length} connections
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

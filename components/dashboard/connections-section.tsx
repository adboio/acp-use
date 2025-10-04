"use client";

import { ConnectionManager } from "@/components/oauth/connection-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ConnectionsSectionProps {
  merchantId: string;
}

export function ConnectionsSection({ merchantId }: ConnectionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Connected Services</CardTitle>
            <CardDescription>
              Manage your integrations with Square, Gumroad, Wix, and other
              platforms
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/connections">
              <ExternalLink className="h-4 w-4 mr-2" />
              See All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ConnectionManager merchantId={merchantId} />
      </CardContent>
    </Card>
  );
}

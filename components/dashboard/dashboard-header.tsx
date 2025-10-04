"use client";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { User, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ACP</span>
              </div> */}
              <span className="text-xl font-bold text-gray-900">acp-use</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-500 hover:text-orange-600"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/connections" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard/connections")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-500 hover:text-orange-600"
                }`}
              >
                Connections
              </Link>
              <Link 
                href="/demo" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/demo")
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-500 hover:text-orange-600"
                }`}
              >
                Demo
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email || user.user_metadata?.email || "User"}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

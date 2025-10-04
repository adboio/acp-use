"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Brain, Zap, Search } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from "recharts";
import { useState, useEffect } from "react";

export function AnalyticsSection() {
  const [isClient, setIsClient] = useState(false);

  // Mock analytics data with time series
  const revenueData = [
    { month: 'Jan', revenue: 8200 },
    { month: 'Feb', revenue: 9100 },
    { month: 'Mar', revenue: 8800 },
    { month: 'Apr', revenue: 10200 },
    { month: 'May', revenue: 11800 },
    { month: 'Jun', revenue: 12450 },
  ];


  const agentSalesData = [
    { agent: 'ChatGPT', sales: 5200, orders: 34, color: '#10A37F', icon: Bot },
    { agent: 'Claude', sales: 3800, orders: 28, color: '#FF6B35', icon: Brain },
    { agent: 'Gemini', sales: 2100, orders: 18, color: '#4285F4', icon: Zap },
    { agent: 'Perplexity', sales: 1350, orders: 9, color: '#8B5CF6', icon: Search },
  ];

  // Transform data for pie chart
  const pieChartData = agentSalesData.map(agent => ({
    name: agent.agent,
    value: agent.sales,
    color: agent.color,
    orders: agent.orders,
    icon: agent.icon
  }));


  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };


  return (
    <div className="space-y-8">
      {/* Charts Section */}
      {!isClient ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Loading Charts...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Loading Charts...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full flex items-center justify-center">
                <AreaChart width={500} height={300} data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Sales Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by AI Agent</CardTitle>
              <CardDescription>Revenue breakdown by AI platform this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full flex items-center justify-center">
                <PieChart width={500} height={300} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={(props) => {
                      const { name, value } = props;
                      const percentage = ((Number(value) / 12450) * 100).toFixed(0);
                      return `${name} ${percentage}%`;
                    }}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const data = props.payload;
                      const percentage = ((data.value / 12450) * 100).toFixed(1);
                      return [
                        `${formatCurrency(Number(value))} (${percentage}%)`, 
                        data.name
                      ];
                    }}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload;
                      return `${data?.orders} orders`;
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </div>
              {/* Icon Legend */}
              <div className="flex justify-center gap-6 mt-4">
                {agentSalesData.map((agent, index) => {
                  const IconComponent = agent.icon;
                  const percentage = ((agent.sales / 12450) * 100).toFixed(0);
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                        style={{ backgroundColor: agent.color }}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">{agent.agent}</span>
                      <span className="text-xs text-gray-500">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

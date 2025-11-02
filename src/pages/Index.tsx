"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users } from "lucide-react";
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const dummyData = {
    topMetrics: {
      total_customers_success: "23K",
      total_customers_fail: "2K",
      total_users_success: "2.5K",
      total_users_fail: "1.2K",
    },
    pieChartData: [
      { name: "Customer Success", value: 300 },
      { name: "Customer Failure", value: 70 },
      { name: "User Success", value: 280 },
      { name: "User Failure", value: 60 },
    ],
    lineChartData: [
      { day: "20/10/2025", customers: 420, users: 300 },
      { day: "21/10/2025", customers: 460, users: 320 },
      { day: "22/10/2025", customers: 500, users: 340 },
      { day: "23/10/2025", customers: 520, users: 360 },
      { day: "24/10/2025", customers: 540, users: 380 },
    ],
    barChartData: [
      { day: "15/10/2025", success: 120, failure: 30 },
      { day: "16/10/2025", success: 140, failure: 25 },
      { day: "17/10/2025", success: 160, failure: 40 },
      { day: "18/10/2025", success: 150, failure: 35 },
      { day: "19/10/2025", success: 180, failure: 45 },
      { day: "20/10/2025", success: 170, failure: 30 },
      { day: "21/10/2025", success: 160, failure: 25 },
    ],
  };
  //Fetch Dashboard Data (simulate API)
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.warn("API failed, using dummy data:", error);
        setDashboardData(dummyData);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
          <span className="ml-3 text-lg text-gray-600">Loading Dashboard...</span>
        </div>
      </Layout>
    );
  }
  const { topMetrics, pieChartData, lineChartData, barChartData } = dashboardData;
  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7"];
  const metricCards = [
    {
      title: "Total Customers (Success)",
      value: topMetrics.total_customers_success,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Customers (Failure)",
      value: topMetrics.total_customers_fail,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Users (Success)",
      value: topMetrics.total_users_success,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Users (Failure)",
      value: topMetrics.total_users_fail,
      color: "bg-cyan-100 text-cyan-600",
    },
  ];
  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Overview</h1>
          <div className="flex items-center gap-3">
            <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">
              Monthly
            </button>
            <button className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg">
              This Week
            </button>
          </div>
        </div>
        {/* ===== TOP METRICS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <Card
              key={index}
              className="border-0 shadow-sm bg-white rounded-2xl p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-sm text-gray-500">{metric.title}</h1>
                  <h4 className="text-2xl font-bold text-gray-800 mt-1">
                    {metric.value}
                  </h4>
                </div>
                <div className={`p-3 rounded-full ${metric.color}`}>
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        {/* ===== CHARTS SECTION ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LINE CHART */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl xl:col-span-2">
            <CardHeader>
              <CardTitle>Customer vs User Growth (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6" }}
                    isAnimationActive
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6" }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* BAR CHART */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>📊 Daily Success vs Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="success" fill="#22c55e" barSize={40} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="failure" fill="#ef4444" barSize={40} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        {/* PIE CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Overall Success vs Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

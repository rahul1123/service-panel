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
import { useState } from "react";
import { Users, Eye, Package, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  // 📊 Monthly Data - Customers vs Users
  const monthlyData = [
    { month: "Jan", customers: 200, users: 150 },
    { month: "Feb", customers: 250, users: 180 },
    { month: "Mar", customers: 300, users: 210 },
    { month: "Apr", customers: 350, users: 230 },
    { month: "May", customers: 400, users: 280 },
    { month: "Jun", customers: 420, users: 300 },
    { month: "Jul", customers: 460, users: 320 },
    { month: "Aug", customers: 500, users: 340 },
    { month: "Sep", customers: 520, users: 360 },
    { month: "Oct", customers: 540, users: 380 },
    { month: "Nov", customers: 560, users: 400 },
    { month: "Dec", customers: 580, users: 420 },
  ];

  // 📈 Success vs Failure (Daily)
  const successData = [
    { day: "Mon", success: 120, failure: 30 },
    { day: "Tue", success: 140, failure: 25 },
    { day: "Wed", success: 160, failure: 40 },
    { day: "Thu", success: 150, failure: 35 },
    { day: "Fri", success: 180, failure: 45 },
    { day: "Sat", success: 170, failure: 30 },
    { day: "Sun", success: 160, failure: 25 },
  ];

  // 🥧 Overall Summary
  const pieData = [
    { name: "Customer Success", value: 3000 },
    { name: "Customer Failure", value: 700 },
    { name: "User Success", value: 2800 },
    { name: "User Failure", value: 600 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7"];

  // 🔹 Summary Cards
  const topMetrics = [
    {
      title: "Total Customers (Success)",
      value: "2300",
      icon: Eye,
      trend: "+0.43%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Users (Success)",
      value: "2700",
      icon: DollarSign,
      trend: "+4.35%",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Customers (Failure)",
      value: "900",
      icon: Package,
      trend: "+2.59%",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Users (Failure)",
      value: "850",
      icon: Users,
      trend: "-0.95%",
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

        {/* ===== TOP METRIC CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topMetrics.map((metric, i) => (
            <Card
              key={i}
              className="border-0 shadow-sm bg-white rounded-2xl p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-sm text-gray-500">{metric.title}</h1>
                  <h4 className="text-2xl font-bold text-gray-800 mt-1">
                    {metric.value}
                  </h4>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ===== CHARTS SECTION ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LINE CHART */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl xl:col-span-2">
            <CardHeader>
              <CardTitle>Customer vs User Growth (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
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
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* PIE CHART */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Overall Success vs Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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

        {/* ===== BAR CHART SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>📊 Daily Success vs Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successData}>
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
      </div>
    </Layout>
  );
}

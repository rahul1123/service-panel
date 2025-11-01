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
import { useEffect, useState } from "react";
import { Users, Eye, Package, DollarSign } from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);

  // 🔹 Sample Data for Customer and User (Monthly)
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

  // 🔹 Sample Data for Success vs Failure (Daily)
  const successData = [
    { day: "Mon", success: 120, failure: 30 },
    { day: "Tue", success: 140, failure: 25 },
    { day: "Wed", success: 160, failure: 40 },
    { day: "Thu", success: 150, failure: 35 },
    { day: "Fri", success: 180, failure: 45 },
    { day: "Sat", success: 170, failure: 30 },
    { day: "Sun", success: 160, failure: 25 },
  ];

  // 🔹 Sample Overall Pie Data
  const pieData = [
    { name: "Customer Success", value: 3000 },
    { name: "Customer Failure", value: 700 },
    { name: "User Success", value: 2800 },
    { name: "User Failure", value: 600 },
  ];

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7"];

  // 🔹 Top Metrics
  const topMetrics = [
    {
      title: "Total Customers (Success)",
      value: "3.5K",
      icon: Eye,
      trend: "+0.43%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Users (Success)",
      value: "$4.2K",
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">
              Monthly
            </button>
            <button className="text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg">
              This Week
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topMetrics.map((m, i) => (
            <Card
              key={i}
              className="border-0 shadow-sm bg-white rounded-2xl p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{m.title}</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {m.value}
                  </h2>
                  <p
                    className={`text-sm mt-1 ${
                      m.trend.includes("-") ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {m.trend}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${m.color}`}>
                  <m.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Line Chart - Customer vs User (Monthly) */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Customer vs User (Monthly Growth)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
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

          {/* Bar Chart - Success vs Failure */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Success vs Failure (Daily)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
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
                  <Bar
                    dataKey="success"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="failure"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Overall Summary */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Overall Success / Failure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
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
      </div>
    </Layout>
  );
};

export default Dashboard;

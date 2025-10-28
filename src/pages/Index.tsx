import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Package, DollarSign, Eye } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://16.171.117.2:3000";

const Dashboard = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/common/getDashboardStats`);
      setMetrics(data.result || []);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  const paymentsData = [
    { month: "Jan", received: 20, due: 10 },
    { month: "Feb", received: 40, due: 20 },
    { month: "Mar", received: 45, due: 25 },
    { month: "Apr", received: 50, due: 28 },
    { month: "May", received: 70, due: 30 },
    { month: "Jun", received: 90, due: 35 },
    { month: "Jul", received: 85, due: 40 },
    { month: "Aug", received: 95, due: 42 },
    { month: "Sep", received: 100, due: 45 },
    { month: "Oct", received: 110, due: 50 },
    { month: "Nov", received: 115, due: 52 },
    { month: "Dec", received: 120, due: 55 },
  ];

  const profitData = [
    { day: "Mon", sales: 60, revenue: 40 },
    { day: "Tue", sales: 70, revenue: 50 },
    { day: "Wed", sales: 80, revenue: 55 },
    { day: "Thu", sales: 90, revenue: 65 },
    { day: "Fri", sales: 100, revenue: 70 },
    { day: "Sat", sales: 85, revenue: 60 },
    { day: "Sun", sales: 75, revenue: 50 },
  ];

  const topMetrics = [
    {
      title: "Total Views",
      value: "3.5K",
      icon: Eye,
      trend: "+0.43%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Profit",
      value: "$4.2K",
      icon: DollarSign,
      trend: "+4.35%",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Products",
      value: "3.5K",
      icon: Package,
      trend: "+2.59%",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Users",
      value: "3.5K",
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

        {/* Metric Cards */}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payments Overview */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Payments Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={paymentsData}>
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
                    dataKey="received"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="due"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-sm text-gray-600 mt-4">
                <div>
                  Received Amount:{" "}
                  <span className="text-gray-900 font-semibold">$580.00</span>
                </div>
                <div>
                  Due Amount:{" "}
                  <span className="text-gray-900 font-semibold">$628.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit This Week */}
          <Card className="border-0 shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Profit This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={profitData}>
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
                    dataKey="sales"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

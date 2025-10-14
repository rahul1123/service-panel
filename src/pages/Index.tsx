import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useEffect, useState } from "react";
import PostNewJobModal from "@/components/modals/PostNewJobModal";
import axios from "axios";
const API_BASE_URL = " http://13.62.22.94:3000";

type Metric = {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  trend: "up" | "down";
};
const metricsData = [
  {
    title: "Active Clients",
    value: 12,
    change: "+2 new this month",
    icon: Building2,
    trend: "up" as const,
  },
  {
    title: "Active Jobs",
    value: 24,
    change: "+12% from last month",
    icon: Briefcase,
    trend: "up" as const,
  },
  {
    title: "Total Candidates",
    value: 1847,
    change: "+5% from last month",
    icon: Users,
    trend: "up" as const,
  },
  {
    title: "Placement Rate",
    value: "23%",
    change: "+3% from last quarter",
    icon: TrendingUp,
    trend: "up" as const,
  },
];

const chartData = [
  { month: "Jan", applications: 120, hires: 8, clients: 8 },
  { month: "Feb", applications: 150, hires: 12, clients: 9 },
  { month: "Mar", applications: 180, hires: 15, clients: 10 },
  { month: "Apr", applications: 220, hires: 18, clients: 11 },
  { month: "May", applications: 190, hires: 14, clients: 12 },
  { month: "Jun", applications: 240, hires: 22, clients: 12 },
];

const recentActivities = [
  {
    id: 1,
    action: "New client onboarded",
    candidate: "",
    job: "TechCorp Solutions",
    time: "1 hour ago",
    type: "client",
  },
  {
    id: 2,
    action: "Candidate placed",
    candidate: "Sarah Johnson",
    job: "Frontend Developer at TechCorp",
    time: "2 hours ago",
    type: "hire",
  },
  {
    id: 3,
    action: "Interview completed",
    candidate: "Mike Chen",
    job: "Backend Engineer at HealthcarePlus",
    time: "4 hours ago",
    type: "interview",
  },
  {
    id: 4,
    action: "New job received",
    candidate: "",
    job: "Product Manager at FinanceFlow",
    time: "6 hours ago",
    type: "job",
  },
  {
    id: 5,
    action: "Application received",
    candidate: "Emma Davis",
    job: "UX Designer at Creative Studios",
    time: "1 day ago",
    type: "application",
  },
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [metricsData, setMetricsData] = useState<Metric[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    fetchstats();
  }, []);
  const fetchstats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/common/getDashboardStats`
      );
      setMetricsData(data.result);
      console.log(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Welcome back! Here's you perform the crud operation.
            </p>
          </div>
       
        </div>

        {/* <AddClientModal
          open={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
        /> */}

        <PostNewJobModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

    
    

   
      </div>
    </Layout>
  );
};

export default Index;


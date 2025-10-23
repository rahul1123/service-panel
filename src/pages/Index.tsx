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
import axios from "axios";
import { API_BASE_URL } from "../config/api";
 

 
 
const Index = () => {

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

        {/* <PostNewJobModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        /> */}

    
    

   
      </div>
    </Layout>
  );
};

export default Index;


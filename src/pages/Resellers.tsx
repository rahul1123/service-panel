import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import ResellerViewList from "@/components/ResellerViewList";
import ResellerModal from "@/components/modals/ResellerModal"; // ✅ Correct import
const API_BASE_URL = "http://localhost:3000";
interface PrimaryContactInfo {
  email: string;
  firstName: string;
  lastName: string;
}
interface ResellerSchema {
  id: number;
  domain: string;
  orgDisplayName: string;
  alternate_email: string;
  primaryContactInfo: PrimaryContactInfo;
  created_at: string;
  updated_at: string;
}

export default function Resellers() {
  const [resellers, setResellers] = useState<ResellerSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/resellers`);
      
      setResellers(data.result);
    } catch (err) {
      console.error("Failed to fetch resellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Reseller Management</h1>
            <p className="text-slate-600 mt-1">
              Manage your Resellers.
            </p>
          </div>
        </div>

        {/* ✅ Correct props passed */}
        <ResellerViewList
          loading={loading}
          fetchResellers={fetchResellers}
          resellers={resellers}
        />

        {/* Optional: Modal for adding/editing resellers (if needed outside the table) */}
        
        <ResellerModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          fetchResellers={fetchResellers}
          editingReseller={null}
          setEditingReseller={() => {}}
        />
       
      </div>
    </Layout>
  );
}

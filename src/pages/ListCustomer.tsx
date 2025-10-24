import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";

export default function CustomerFileUploads() {
  const [uploads, setUploads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { getUserDetails } = useAuth(); // ✅ from context

  const dummyData = [
    {
      id: 1,
      batch_id: 122,
      primaryEmail: "dummy@example.com",
      Username: "DummyUser",
      password: "******",
      creationId: "DUMMY-001",
      status: "N/A",
      message: "API failed, showing dummy data",
      created_at: "2025-10-23T18:22:49.000Z",
    },
    {
      id: 2,
      batch_id: 123,
      primaryEmail: "backup@example.com",
      Username: "BackupUser",
      password: "******",
      creationId: "DUMMY-002",
      status: "N/A",
      message: "Fallback record",
      created_at: "2025-10-22T16:11:45.000Z",
    },
  ];

  // 🟢 Fetch all Customers
  const fetchCustomer = async () => {
    setLoading(true);

    try {
      const user = getUserDetails(); // ✅ get current logged-in user
      const token = user?.token; // ✅ safely extract token

      if (!token) {
        toast.error("No valid token found. Please log in again.");
        setUploads(dummyData);
        return;
      }

      const url = `${API_BASE_URL}/list/customers`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`, // ✅ dynamic token here
      };

      const { data } = await axios.get(url, { headers });
      console.log("Customer list response:", data);
      setUploads(data?.length ? data: dummyData);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      toast.error("Failed to fetch customers, showing dummy data");
      setUploads(dummyData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Customers</h1>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-4">Loading customers...</div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">App Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Domain</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status Code</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Response</th>
                  {/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Message</th> */}
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
                </tr>
              </thead>
<tbody className="bg-white divide-y divide-gray-200">
  {uploads.map((u, i) => {
    // Parse domain from request_body safely
    let domain = '';
    try {
      const reqBody = JSON.parse(u.request_body || '{}');
      domain = reqBody.domain || '';
    } catch (err) {
      console.error('Invalid JSON in request_body', err);
    }

    // Determine what to show in Response column
    const responseText = u.status_code === 200 ? 'ok' : u.response_body;

    return (
      <tr key={u.id}>
        <td className="px-4 py-2 text-sm">{i + 1}</td>
        <td className="px-4 py-2 text-sm">{u.app_name}</td>
        <td className="px-4 py-2 text-sm">{domain}</td>
        <td className="px-4 py-2 text-sm">{u.status_code}</td>
        <td className="px-4 py-2 text-sm">{responseText}</td>
        <td className="px-4 py-2 text-sm">
          {new Date(u.created_at).toLocaleString()}
        </td>
      </tr>
    );
  })}
</tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

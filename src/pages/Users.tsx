import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import UserFileModal from "@/components/modals/UserFileModal";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";
// User File Upload Schema
interface UserFileUpload {
  id: number;
  batch_id: string | number;
  bulk_type: string;
  original_file_name?: string;
  file_name: string;
  file_path: string;
  status: number;
  total_count?: string;
  added_by?: string;
  added_on: string;
  completed_at?: string | null;
}
export default function UserFileUploads() {
  const [uploads, setUploads] = useState<UserFileUpload[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getUserDetails } = useAuth(); //get function from AuthContext
  const fetchUserFileUploads = async () => {
    setLoading(true);
    try {
      const userDetails = getUserDetails();
      const token = userDetails?.token;

      if (!token) {
        toast.error("No valid token found. Please log in again.");
        setUploads([]);
        return;
      }
      const url = `${API_BASE_URL}/list/bulkupload`;
      const { data } = await axios.get(url, {
        headers: {
          "x-api-key": "f7ab26185b14fc87db613850887be3b8",
          Authorization: `Bearer ${token}`,
        },
        params: { type: "user" }, // ✅ moved outside headers
      });

      console.log("User list response:", data);

      if (!data?.length) {
        toast("No data from API, showing dummy data");
        setUploads([]);
      } else {
        setUploads(data);
      }
    } catch (err) {
      console.error("Failed to fetch customer file uploads", err);
      toast.error("API request failed, showing dummy data");
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFileUploads();
  }, []);

  // Handle CSV Export
  const handleExport = () => {
    if (!uploads.length) {
      toast.error("No files to export.");
      return;
    }
    const header = ["Batch ID", "Bulk Type", "File Name", "File Path", "Status", "Added By", "Added On"];
    const rows = uploads.map((u) => [
      u.batch_id,
      u.bulk_type,
      u.file_name,
      u.file_path || "N/A",
      u.status === 0 ? "Pending" : "Completed",
      u.added_by || "N/A",
      new Date(u.added_on).toLocaleString(),
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const dateStr = new Date().toISOString().split("T")[0];
    saveAs(blob, `user_file_uploads_${dateStr}.csv`);
    toast.success("Exported CSV file successfully!");
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User File Uploads</h1>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="bg-white/80">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" /> Upload File
            </Button>
          </div>
        </div>

        {/* Modal */}
        <UserFileModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          fetchFileUploads={fetchUserFileUploads}
          editingFileUpload={null}
          setEditingFileUpload={() => {}}
        />

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading files...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Bulk Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File Path</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Count</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Added By</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Added On</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Completed At</th>
                </tr>
              </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
              {uploads.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.batch_id}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.bulk_type}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.file_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.file_path}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {file.status === 1 ? "Completed" : "Pending"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.total_count}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.added_by}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.added_on).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {file.completed_at ? new Date(file.completed_at).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

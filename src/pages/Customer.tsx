import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import UserFileModal from "@/components/modals/UserFileModal";

const API_BASE_URL = "http://localhost:3000";

// User File Upload Form Schema
interface UserFileUploadFormValues {
  userId: number;
  fileName: string;
  filePath: string;
  status: string;
  remarks?: string;
  batchId: string; // UUID batch id
  processedAt?: string;
  
}

// User File Upload List Schema
interface UserFileUpload {
  id: number;
  userId: number;
  fileName: string;
  filePath: string;
  uploadTime: string;
  status: string;
  remarks: string | null;
  batchId: string;
  processedAt: string | null;
  file_name:string;
  upload_time:string;
  batch_id:string
}

export default function CustomerFileUploads() {
  const [uploads, setUploads] = useState<UserFileUpload[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true);

  // Fetch all file uploads
  const fetchUserFileUploads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/user-file-uploads`);
      setUploads(data.result || []);
    } catch (err) {
      console.error("Failed to fetch user file uploads", err);
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

    const header = ["File Name", "Remark", "Status", "Created At"];

    const rows = uploads.map((u) => [
      u.fileName,
      u.remarks ?? "",
      u.status,
      u.uploadTime,
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((field) => `"${field ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `user_file_uploads_${dateStr}.csv`;

    saveAs(blob, fileName);
    toast.success("Exported CSV file successfully!");
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User File Uploads</h1>
            <p className="text-slate-600 text-sm">Manage and track uploaded user files</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="bg-white/80"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        {/* Modal */}
     <UserFileModal
  open={isModalOpen}
  setOpen={setIsModalOpen}
  fetchFileUploads={fetchUserFileUploads} // ✅ Correct prop name
  editingFileUpload={null}
  setEditingFileUpload={() => {}}
/>

        {/* Table or File Cards */}
      <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Id</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remarks</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Upload Time</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {uploads.map((file,index) => (
            <tr key={file.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{index+1}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.file_name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 break-all">{file.batch_id}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.remarks || "N/A"}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.status|| "N/A"}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {new Date(file.upload_time).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </div>
    </Layout>
  );
}

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
}

export default function UserFileUploads() {
  const [uploads, setUploads] = useState<UserFileUpload[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploads.length === 0 && !loading ? (
            <p className="text-gray-500">No files uploaded yet.</p>
          ) : (
            uploads.map((file) => (
              <div
                key={file.id}
                className="border rounded-md p-4 shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold">{file.fileName}</h3>
                <p className="text-sm text-gray-600">Status: {file.status}</p>
                <p className="text-sm text-gray-600">Remarks: {file.remarks || "N/A"}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Uploaded: {new Date(file.uploadTime).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

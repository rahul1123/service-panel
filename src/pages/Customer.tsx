import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import CustomerFileModel from "@/components/modals/CustomerFileModel";
import { API_BASE_URL } from "../config/api";

// Schema matching API response
interface CustomerFileUpload {
  batch_id: number;
  bulk_type: string;
  original_file_name: string;
  file_name: string;
  file_path: string;
  status: number; // 0 = Pending, 1 = Completed
  total_count: string;
  added_by: string;
  added_on: string;
  completed_at: string | null;
}

export default function CustomerFileUploads() {
  const [uploads, setUploads] = useState<CustomerFileUpload[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dummy fallback if API fails
  const dummyUploads: CustomerFileUpload[] = [
    {
      batch_id: 0,
      bulk_type: "user",
      original_file_name: "sample-customer-file.csv",
      file_name: "dummy.csv",
      file_path: "/uploads/dummy.csv",
      status: 0,
      total_count: "0.00 MB",
      added_by: "admin",
      added_on: new Date().toISOString(),
      completed_at: null,
    },
  ];

  // Fetch customer file uploads
  const fetchCustomerFileUploads = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/v1/panel/list/bulkupload`, {
        params: { type: "customer" },
      });

      if (!data?.result?.length) {
        toast("No data from API, showing dummy data");
        setUploads(dummyUploads);
      } else {
        setUploads(data.result);
      }
    } catch (err) {
      console.error("Failed to fetch customer file uploads", err);
      toast.error("API request failed, showing dummy data");
      setUploads(dummyUploads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerFileUploads();
  }, []);

  // Handle CSV Export
  const handleExport = () => {
    if (!uploads.length) {
      toast.error("No files to export.");
      return;
    }

    const header = [
      "Batch ID",
      "Bulk Type",
      "Original File Name",
      "File Name",
      "File Path",
      "Status",
      "Total Count",
      "Added By",
      "Added On",
      "Completed At",
    ];

    const rows = uploads.map((u) => [
      u.batch_id,
      u.bulk_type,
      u.original_file_name,
      u.file_name,
      u.file_path,
      u.status === 0 ? "Pending" : "Completed",
      u.total_count,
      u.added_by,
      new Date(u.added_on).toLocaleString(),
      u.completed_at ? new Date(u.completed_at).toLocaleString() : "N/A",
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `customer_file_uploads_${new Date().toISOString().split("T")[0]}.csv`;
    saveAs(blob, fileName);
    toast.success("Exported CSV file successfully!");
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customer File Uploads</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="bg-white/80">
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
        <CustomerFileModel
          open={isModalOpen}
          setOpen={setIsModalOpen}
          fetchFileUploads={fetchCustomerFileUploads}
          editingFileUpload={null}
          setEditingFileUpload={() => {}}
        />

        {/* Table */}
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
                    {file.status === 0 ? "Pending" : "Completed"}
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
      </div>
    </Layout>
  );
}

import Layout from "@/components/Layout";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import UserFileModal from "@/components/modals/UserFileModal";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";

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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { getUserDetails } = useAuth();

  const fetchUserFileUploads = async () => {
    setLoading(true);
    try {
      const token = getUserDetails()?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        setUploads([]);
        return;
      }
      const { data } = await axios.get(`${API_BASE_URL}/list/bulkupload`, {
        headers: {
          "x-api-key": "f7ab26185b14fc87db613850887be3b8",
          Authorization: `Bearer ${token}`,
        },
        params: { type: "user" },
      });
      setUploads(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch uploads");
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFileUploads();
  }, []);

  // Sorting
  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const sortedFilteredData = useMemo(() => {
    let filtered = [...uploads];

    // Date filter
    if (fromDate) filtered = filtered.filter(u => new Date(u.added_on) >= new Date(fromDate));
    if (toDate) filtered = filtered.filter(u => new Date(u.added_on) <= new Date(toDate));

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        String(u.batch_id).toLowerCase().includes(term) ||
        u.bulk_type.toLowerCase().includes(term) ||
        u.file_name.toLowerCase().includes(term) ||
        (u.added_by || "").toLowerCase().includes(term)
      );
    }

    // Sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof UserFileUpload];
        const bValue = b[sortConfig.key as keyof UserFileUpload];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      });
    }

    return filtered;
  }, [uploads, searchTerm, fromDate, toDate, sortConfig]);

  const totalPages = Math.ceil(sortedFilteredData.length / itemsPerPage);
  const paginatedData = sortedFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Export
  const handleExport = () => {
    if (!uploads.length) return toast.error("No files to export.");
    const header = ["Batch ID", "Bulk Type", "File Name", "File Path", "Status", "Added By", "Added On"];
    const rows = sortedFilteredData.map(u => [
      u.batch_id,
      u.bulk_type,
      u.file_name,
      u.file_path || "N/A",
      u.status === 0 ? "Pending" : "Completed",
      u.added_by || "N/A",
      new Date(u.added_on).toLocaleString(),
    ]);
    const csvContent = [header, ...rows].map(r => r.map(f => `"${f}"`).join(",")).join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), `user_file_uploads_${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Exported CSV successfully!");
  };

  const getArrow = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ArrowUp className="inline w-3 h-3 ml-1" /> : <ArrowDown className="inline w-3 h-3 ml-1" />;
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">User File Uploads</h1>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border rounded p-2 flex-1"
          />
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="border rounded p-2"
          />
          <Button onClick={() => {setFromDate(""); setToDate("");}} >Clear Dates</Button>
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
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                  <th onClick={() => handleSort("batch_id")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Batch ID {getArrow("batch_id")}
                  </th>
                  <th onClick={() => handleSort("bulk_type")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Bulk Type {getArrow("bulk_type")}
                  </th>
                  <th onClick={() => handleSort("file_name")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    File Name {getArrow("file_name")}
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File Path</th>
                  <th onClick={() => handleSort("status")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Status {getArrow("status")}
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Count</th>
                  <th onClick={() => handleSort("added_by")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Added By {getArrow("added_by")}
                  </th>
                  <th onClick={() => handleSort("added_on")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Added On {getArrow("added_on")}
                  </th>
                  <th onClick={() => handleSort("completed_at")} className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Completed At {getArrow("completed_at")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length ? (
                  paginatedData.map((file, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.batch_id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.bulk_type}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.file_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.file_path}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.status === 1 ? "Completed" : "Pending"}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.total_count}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{file.added_by}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(file.added_on).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{file.completed_at ? new Date(file.completed_at).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-500 py-4">No uploads found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-6 p-4 bg-gray-50 border-t">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Previous</Button>
                <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages || 1}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

import Layout from "@/components/Layout";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, ArrowUp, ArrowDown } from "lucide-react";
import axios from "axios";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import CustomerFileModel from "@/components/modals/CustomerFileModel";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [activeFromDate, setActiveFromDate] = useState("");
  const [activeToDate, setActiveToDate] = useState("");
  const { getUserDetails } = useAuth();
  const fetchCustomerFileUploads = async (page = 1, from?: string, to?: string) => {
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
        params: { type: "customer" },
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
    fetchCustomerFileUploads();
  }, []);

  const handleExport = () => {
    if (!uploads.length) return toast.error("No files to export.");
    const header = ["Batch ID","Bulk Type","Original File Name","File Name","File Path","Status","Total Count","Added By","Added On","Completed At"];
    const rows = uploads.map(u => [
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
    const csvContent = [header, ...rows].map(r => r.map(f => `"${f}"`).join(",")).join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), `customer_file_uploads_${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Exported CSV successfully!");
  };

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  // Filtered + sorted data
  const filteredData = useMemo(() => {
    let data = [...uploads];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(u =>
        String(u.batch_id).includes(term) ||
        u.bulk_type.toLowerCase().includes(term) ||
        u.file_name.toLowerCase().includes(term) ||
        (u.added_by || "").toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (fromDate) data = data.filter(u => new Date(u.added_on) >= new Date(fromDate));
    if (toDate) data = data.filter(u => new Date(u.added_on) <= new Date(toDate));

    // Sorting
    if (sortConfig) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof CustomerFileUpload];
        const bValue = b[sortConfig.key as keyof CustomerFileUpload];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      });
    }

    return data;
  }, [uploads, searchTerm, fromDate, toDate, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getArrow = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ArrowUp className="inline w-3 h-3 ml-1" /> : <ArrowDown className="inline w-3 h-3 ml-1" />;
  };


    const handleDateFilter = () => {
      if (!fromDate || !toDate) {
        toast.error("Please select both From and To dates");
        return;
      }
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
        toast.error("Invalid date range");
        return;
      }
      setActiveFromDate(fromDate);
      setActiveToDate(toDate);
      setCurrentPage(1);
     fetchCustomerFileUploads(1, fromDate, toDate);
    };

   

   const handleSampleExport = () => {
  const headers = [
    "domain",
    "email",
    "password",
    "username",
    "recoveryemail",
    "license",
  ];

  const sampleData = [
    [
      "shopmonautenadsagency.info",
      "frank@shopmonautenadsagency.info",
      "Shopmonauten!92$XeTq",
      "Frank Geiger",
      "ishibolrecovery@gmail.com",
      "3",
    ],
  ];

  const csv =
    [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Upload_sample_customer.csv";
  link.click();
  URL.revokeObjectURL(url);
};
  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Customer File Uploads</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="flex items-center border rounded-md px-2">
            <i className="bi bi-search text-slate-400" />
            <Input
              placeholder="Search by Batch ID,Bulk Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none focus-visible:ring-0 shadow-none w-64"
            />
          </div>

     {/* <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded p-2 flex-1" />
          */}

{/*           
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border rounded p-2" />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border rounded p-2" /> */}

             <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">From:</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="border rounded p-2"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">To:</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="border rounded p-2"
                      />
                    </div>
                    <Button onClick={handleDateFilter} disabled={loading} size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                      {loading ? "Submit" : "Submit"}
                    </Button>



          {/* <Button onClick={() => { setFromDate(""); setToDate(""); }}>Clear Dates</Button> */}
                <Button onClick={handleExport} variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

             <Button onClick={handleSampleExport} variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Download Sample File
            </Button>
        </div>

        {/* Modal */}
        <CustomerFileModel open={isModalOpen} setOpen={setIsModalOpen} fetchFileUploads={fetchCustomerFileUploads} editingFileUpload={null} setEditingFileUpload={() => {}} />

        {/* Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  { label: "#", key: "" },
                  { label: "Batch ID", key: "batch_id" },
                  { label: "Bulk Type", key: "bulk_type" },
                  { label: "File Name", key: "file_name" },
                  { label: "File Path", key: "" },
                  { label: "Status", key: "status" },
                  { label: "Total Count", key: "" },
                  { label: "Added By", key: "added_by" },
                  { label: "Added On", key: "added_on" },
                  { label: "Completed At", key: "completed_at" },
                ].map(h => (
                  <th key={h.label} onClick={() => h.key && handleSort(h.key)} className={`px-4 py-2 text-left text-sm font-medium text-gray-700 ${h.key ? "cursor-pointer" : ""}`}>
                    {h.label} {h.key && getArrow(h.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length ? paginatedData.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.batch_id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.bulk_type}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.file_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.file_path}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.status === 1 ? "Completed" : "Pending"}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.total_count}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.added_by}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(file.added_on).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{file.completed_at ? new Date(file.completed_at).toLocaleString() : "N/A"}</td>
                </tr>
              )) : (
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
              <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

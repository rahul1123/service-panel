import Layout from "@/components/Layout";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";
export default function ListCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeFromDate, setActiveFromDate] = useState("");
  const [activeToDate, setActiveToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  );
  const { getUserDetails } = useAuth();
  const fetchCustomers = async (page = 1, from?: string, to?: string) => {
    setLoading(true);
    try {
      const user = getUserDetails();
      const token = user?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const url = `${API_BASE_URL}/list/customers`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };
      const params: any = {
        startDate: from || today,
        endDate: to || today,
      };
      const { data } = await axios.get(url, { headers, params });
      const list = Array.isArray(data) ? data : [];
      setCustomers(list);
      setFilteredCustomers(list);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      toast.error("Failed to fetch customers");
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    fetchCustomers(1, fromDate, toDate);
  };
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter((u) => {
      let domain = "";
      let customerId = "";
      try {
        const reqBody = JSON.parse(u.request_body || "{}");
        domain = reqBody.domain || "";
        customerId = reqBody.customerId || "";
      } catch { }

      return (
        u.app_name?.toLowerCase().includes(q) ||
        domain.toLowerCase().includes(q) ||
        customerId.toLowerCase().includes(q) ||
        String(u.status_code || "").toLowerCase().includes(q)
      );
    });
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchQuery, customers]);
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const sortedCustomers = useMemo(() => {
    if (!sortConfig) return filteredCustomers;
    return [...filteredCustomers].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];
      if (sortConfig.key === "created_at") {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortConfig]);
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const handleExport = () => {
    if (!customers.length) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "App Name",
      "Domain",
      "Customer Id",
      "Licenses",
      "Batch Id",
      "Status Code",
      "Response",
      "Created At",
    ];
    const csv = [
      headers.join(","),
      ...customers.map((u) => {
        let domain = "", maxUnits = "", batch_id = "", customerId = "";
        try {
          const reqBody = JSON.parse(u.request_body || "{}");
          domain = reqBody.domain || "";
          maxUnits = reqBody.maxUnits || "";
          batch_id = reqBody.batch_id || "";
          customerId = reqBody.customerId || "";
        } catch { }
        const responseText = u.status_code === 200 ? "ok" : u.response_body;
        return [
          u.app_name || "",
          domain,
          customerId,
          maxUnits,
          batch_id,
          u.status_code,
          responseText,
          new Date(u.created_at).toLocaleString(),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",");
      }),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Layout>
      <div className="space-y-4">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Customers</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border rounded-md px-2">
              <i className="bi bi-search text-slate-400" />
              <Input
                placeholder="Search by app, domain, customer id, or status code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 shadow-none w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-md text-sm p-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 rounded-md text-sm p-1"
              />
            </div>
            <Button onClick={handleDateFilter} disabled={loading} size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
              {loading ? "Submit" : "Submit"}
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <i className="bi bi-download me-1"></i> Export
            </Button>
          </div>
        </div>
        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading customers...</div>
        ) : sortedCustomers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                    {[
                      { label: "App Name", key: "app_name" },
                      { label: "Status Code", key: "status_code" },
                      { label: "Created At", key: "created_at" },
                      { label: "Domain", key: "domain" },
                      { label: "Customer Id", key: "customer_id" },
                      { label: "Max Unit", key: "max_unit" },
                      { label: "Batch Id", key: "batch_id" },
                      { label: "Response", key: "response" },
                    ].map((col) => {
                      const isSorted = sortConfig?.key === col.key;
                      const isAsc = sortConfig?.direction === "asc";
                      return (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="cursor-pointer select-none px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            {col.label}
                            {isSorted ? (
                              isAsc ? (
                                <i className="bi bi-arrow-up text-blue-600 ms-1"></i>
                              ) : (
                                <i className="bi bi-arrow-down text-blue-600 ms-1"></i>
                              )
                            ) : (
                              <i className="bi bi-arrow-down-up text-gray-400 ms-1"></i>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((u, index) => {
                    let domain = "",
                      maxUnits = "",
                      batch_id = "",
                      customerId = "";
                    try {
                      const reqBody = JSON.parse(u.request_body || "{}");
                      domain = reqBody.domain || "";
                      maxUnits = reqBody.maxUnits || "";
                      batch_id = reqBody.batch_id || "";
                      customerId = reqBody.customerId || "";
                    } catch { }
                    const responseText = u.status_code === 200 ? "ok" : u.response_body;
                    return (
                      <tr key={u.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{startIndex + index + 1}</td>
                        <td className="px-4 py-2 text-sm">{u.app_name || "—"}</td>
                        {/* <td className="px-4 py-2 text-sm">{u.status_code || "—"}</td> */}

                          <td className="px-4 py-3">
            {u.status_code === 200 ? (
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <i className="bi bi-check-circle-fill"></i> 200
              </span>
            ) : (
              <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                {u.status_code}
              </span>
            )}
          </td>
                        <td className="px-4 py-2 text-sm">{new Date(u.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm"><i className="bi bi-globe2 text-gray-400 mr-1"></i>{domain || "—"}</td>
                        <td className="px-4 py-2 text-sm">{customerId || "—"}</td>
                        <td className="px-4 py-2 text-sm">{maxUnits || "—"}</td>
                        <td className="px-4 py-2 text-sm">{batch_id || "—"}</td>
                        <td className="px-4 py-2 text-sm">{responseText || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <i className="bi bi-chevron-left me-1"></i> Previous
                </Button>

                <div className="flex gap-1">
                  {getVisiblePages().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
  
  className={`flex items-center gap-1 transition-colors ${
      page === currentPage
        ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
        : "bg-white text-blue-500 border border-blue-400 hover:bg-blue-50"
    }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                   className={`flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors ${
    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
  }`}
                >
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md text-sm p-1"
                >
                  {Array.from({ length: 8 }, (_, i) => (i + 1) * 50).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-4">No customers found.</div>
        )}
      </div>
    </Layout>
  );
}

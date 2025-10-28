import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";

export default function ListCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const { getUserDetails } = useAuth();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const user = getUserDetails();
      const token = user?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        return;
      }

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (sortConfig) {
        params.sortKey = sortConfig.key;
        params.sortDirection = sortConfig.direction;
      }

      const url = `${API_BASE_URL}/list/customers`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(url, { headers, params });

      const list = Array.isArray(data?.data) ? data.data : [];
      setCustomers(list);
      setTotalRecords(data?.total || list.length);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      toast.error("Failed to fetch customers");
      setCustomers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, sortConfig, fromDate, toDate]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleExport = () => {
    if (!customers.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["App Name", "Status Code", "Created At"];
    const csv = [
      headers.join(","),
      ...customers.map((u) => [
        u.app_name || "",
        u.status_code || "",
        new Date(u.created_at).toLocaleString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Customers</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border rounded-md px-2">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

            <Button variant="default" size="sm" onClick={() => { setCurrentPage(1); fetchCustomers(); }}>
              Filter
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !customers.length}>
              <i className="bi bi-download me-1"></i> Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading customers...</div>
        ) : customers.length > 0 ? (
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
                  {customers.map((u, index) => (
                    <tr key={u.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-2 text-sm">{u.app_name || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.status_code || "—"}</td>
                      <td className="px-4 py-2 text-sm">{new Date(u.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
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
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
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

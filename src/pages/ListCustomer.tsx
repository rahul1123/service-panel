import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";

export default function ListCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { getUserDetails } = useAuth();

  // Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const user = getUserDetails();
      const token = user?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        return;
      }

      const url = `${API_BASE_URL}/list/customers`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(url, { headers });
      setCustomers(data?.length ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      toast.error("Failed to fetch customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter by date
  const handleDateFilter = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From and To dates");
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const filtered = customers.filter((c) => {
      const createdAt = new Date(c.created_at);
      return createdAt >= from && createdAt <= to;
    });

    setCustomers(filtered);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = customers.slice(startIndex, startIndex + itemsPerPage);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Export CSV
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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...customers.map((u) => {
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
          } catch {}

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
          ].join(",");
        }),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `customers_${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Customers</h1>

          <div className="flex flex-wrap items-center gap-2">
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

            <Button
              variant="default"
              size="sm"
              onClick={handleDateFilter}
              disabled={!fromDate || !toDate || loading}
            >
              {loading ? "Filtering..." : "Filter"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || !customers.length}
            >
              Export CSV
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
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">App Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Domain</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Customer Id</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Licenses</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch Id</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status Code</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Response</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
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
                    } catch {}

                    const responseText =
                      u.status_code === 200 ? "ok" : u.response_body;

                    return (
                      <tr key={u.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{startIndex + index + 1}</td>
                        <td className="px-4 py-2 text-sm">{u.app_name || "—"}</td>
                        <td className="px-4 py-2 text-sm">{domain || "—"}</td>
                        <td className="px-4 py-2 text-sm">{customerId || "—"}</td>
                        <td className="px-4 py-2 text-sm">{maxUnits || "—"}</td>
                        <td className="px-4 py-2 text-sm">{batch_id || "—"}</td>
                        <td className="px-4 py-2 text-sm">{u.status_code || "—"}</td>
                        <td className="px-4 py-2 text-sm">{responseText || "—"}</td>
                        <td className="px-4 py-2 text-sm">
                          {new Date(u.created_at).toLocaleString()}
                        </td>
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
                  Previous
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
                  Next
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
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
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

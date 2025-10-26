import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";

export default function CustomerFileUploads() {
  const [uploads, setUploads] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { getUserDetails } = useAuth();

  const fetchCustomer = async () => {
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
      setUploads(data?.length ? data : []);
      setFilteredData(data?.length ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      toast.error("Failed to fetch customers");
      setUploads([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  // Apply Date Filter
  const applyDateFilter = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From and To dates");
      return;
    }

    const filtered = uploads.filter((u) => {
      const createdAt = new Date(u.created_at);
      return (
        createdAt >= new Date(fromDate) && createdAt <= new Date(toDate)
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredData.length) {
      toast.error("No data available to export");
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

    const csvContent = [
      headers.join(","),
      ...filteredData.map((u) => {
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
        ]
          .map((v) => `"${v}"`)
          .join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString()}.csv`;
    a.click();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Customers</h1>
        </div>

        {/* Date Filter & Export */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <label className="block text-sm text-gray-600">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <Button variant="outline" onClick={applyDateFilter}>
              Filter
            </Button>
          </div>

          <Button onClick={exportToCSV} className="bg-blue-600 text-white">
            Export CSV
          </Button>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-4">
            Loading customers...
          </div>
        )}

        {!loading && (
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
                  {paginatedData.map((u, i) => {
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
                      <tr key={u.id}>
                        <td className="px-4 py-2 text-sm">
                          {startIndex + i + 1}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {u.app_name || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">{domain || "—"}</td>
                        <td className="px-4 py-2 text-sm">
                          {customerId || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {maxUnits || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {batch_id || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {u.status_code || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {responseText || "—"}
                        </td>
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
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
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
        )}
      </div>
    </Layout>
  );
}

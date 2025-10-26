import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function CustomerFileUploads() {
  const [appuser, setAppuser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { getUserDetails } = useAuth();

  const fetchCustomer = async (filter = false) => {
    setLoading(true);
    try {
      const user = getUserDetails();
      const token = user?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        setAppuser([]);
        return;
      }

      let url = `https://gwsapi.amyntas.in/api/v1/admin/list/app/users`;
      if (filter && fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      }

      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(url, { headers });
      setAppuser(data?.length ? data : []);
    } catch (err) {
      console.error("Failed to fetch app user", err);
      toast.error("Failed to fetch app User, showing dummy data");
      setAppuser([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  // Pagination
  const totalPages = Math.ceil(appuser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = appuser.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Export CSV
  const handleExport = () => {
    if (!appuser.length) {
      toast.error("No data to export");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        [
          "#",
          "Name",
          "Email",
          "Mobile",
          "Status",
          "Role",
          "Created At",
          "Updated On",
        ].join(","),
        ...appuser.map((u, i) =>
          [
            i + 1,
            u.name || "-",
            u.email || "-",
            u.mobile || "-",
            u.status || "-",
            u.role || "-",
            new Date(u.added_on).toLocaleString(),
            new Date(u.updated_on).toLocaleString(),
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "app_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List App User</h1>

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
              variant="outline"
              onClick={() => fetchCustomer(true)}
              disabled={!fromDate || !toDate || loading}
            >
              Filter
            </Button>

            <Button
              variant="default"
              onClick={handleExport}
              disabled={!appuser.length || loading}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading App User...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Mobile</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">App Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Api Key</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Updated On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((u, i) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2 text-sm">{startIndex + i + 1}</td>
                      <td className="px-4 py-2 text-sm">{u.name || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.email || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.mobile || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.app_name || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.api_key || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.status || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.role || "—"}</td>
                      <td className="px-4 py-2 text-sm">{new Date(u.added_on).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{new Date(u.updated_on).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
              <div className="flex items-center gap-2">
                <Button onClick={handlePrev} disabled={currentPage === 1} variant="outline">
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  onClick={handleNext}
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

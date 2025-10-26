import Layout from "@/components/Layout";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CustomerFileUploads() {
  const [user, setUser] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Date filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Search & sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  );

  const { getUserDetails } = useAuth();

  // 🔹 Fetch Users
  const fetchUser = async (isFiltered = false) => {
    setLoading(true);
    try {
      const userDetails = getUserDetails();
      const token = userDetails?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        return;
      }

      let url = `${API_BASE_URL}/list/users`;
      if (isFiltered && fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      }

      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(url, { headers });
      setUser(data?.length ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to fetch users");
      setUser([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🔹 Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔹 Sort + search logic
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = user;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.primaryEmail?.toLowerCase().includes(term) ||
          u.Username?.toLowerCase().includes(term) ||
          u.batch_id?.toString().includes(term)
      );
    }

    // Sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else if (!isNaN(Date.parse(aVal)) && !isNaN(Date.parse(bVal))) {
          return sortConfig.direction === "asc"
            ? new Date(aVal).getTime() - new Date(bVal).getTime()
            : new Date(bVal).getTime() - new Date(aVal).getTime();
        } else {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
      });
    }

    return filtered;
  }, [user, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // 🔹 Export CSV
  const handleExport = () => {
    if (loading) {
      toast.error("Please wait, data is still loading...");
      return;
    }
    if (!filteredAndSortedUsers.length) {
      toast.error("No user data available to export");
      return;
    }

    const headers = ["#", "Primary Email", "Username", "Batch ID", "Message", "Created At"];
    const rows = filteredAndSortedUsers.map((file, index) => [
      index + 1,
      file.primaryEmail || "",
      file.Username || "",
      file.batch_id || "",
      file.message || "",
      file.created_at ? new Date(file.created_at).toLocaleString() : "",
    ]);

    const escapeCSV = (value: any) => {
      if (value == null) return "";
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "user_list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sorting indicator arrow
  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Users</h1>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search by email, username, or batch ID"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md text-sm p-2"
            />

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
              onClick={() => fetchUser(true)}
              disabled={!fromDate || !toDate || loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || !user.length}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading users...</div>
        ) : filteredAndSortedUsers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                    <th
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("primaryEmail")}
                    >
                      Primary Email {getSortIcon("primaryEmail")}
                    </th>
                    <th
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("Username")}
                    >
                      Username {getSortIcon("Username")}
                    </th>
                    <th
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("batch_id")}
                    >
                      Batch ID {getSortIcon("batch_id")}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Message
                    </th>
                    <th
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("created_at")}
                    >
                      Created At {getSortIcon("created_at")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((file, index) => (
                    <tr key={file.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{startIndex + index + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{file.primaryEmail}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{file.Username}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{file.batch_id || "N/A"}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{file.message || "N/A"}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleString()}
                      </td>
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
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {getVisiblePages().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={handlePageSizeChange}
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
          <div className="text-center text-gray-500 py-4">No users found.</div>
        )}
      </div>
    </Layout>
  );
}

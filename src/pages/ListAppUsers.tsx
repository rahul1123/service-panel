import Layout from "@/components/Layout";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function CustomerFileUploads() {
  const [appuser, setAppuser] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const { getUserDetails } = useAuth();

  /** ✅ Fetch Customer API with Pagination, Date, and Search Parameters */
  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const user = getUserDetails();
      const token = user?.token;
      if (!token) {
        toast.error("No valid token found. Please log in again.");
        setAppuser([]);
        return;
      }

      // Build query params dynamically
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (fromDate && toDate) {
        params.from = fromDate;
        params.to = toDate;
      }

      if (searchTerm) {
        params.search = searchTerm.trim();
      }

      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(`https://gwsapi.amyntas.in/api/v1/admin/list/app/users`, {
        headers,
        params,
      });

      // Adjust response handling depending on your API structure
      setAppuser(data?.data || data || []);
      setTotalItems(data?.total || data?.data?.length || 0);
    } catch (err) {
      console.error("Failed to fetch app user", err);
      toast.error("Failed to fetch app users");
      setAppuser([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  /** 🔁 Fetch on component mount or pagination/filter changes */
  useEffect(() => {
    fetchCustomer();
  }, [currentPage, itemsPerPage, fromDate, toDate, searchTerm]);

  /** Sorting (client-side only) */
  const sortedData = useMemo(() => {
    let sortableData = [...appuser];
    if (sortConfig) {
      sortableData.sort((a, b) => {
        let aVal = a[sortConfig.key] ?? "";
        let bVal = b[sortConfig.key] ?? "";

        if (sortConfig.key === "added_on" || sortConfig.key === "updated_on") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [appuser, sortConfig]);

  /** Sorting Trigger */
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  /** CSV Export */
  const handleExport = () => {
    if (!appuser.length) return toast.error("No data to export");
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["#", "Name", "Email", "Mobile", "Status", "Role", "Created At", "Updated On"].join(","),
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const sortableColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "mobile", label: "Mobile" },
    { key: "status", label: "Status" },
    { key: "role", label: "Role" },
    { key: "added_on", label: "Created At" },
    { key: "updated_on", label: "Updated On" },
  ];

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List App User</h1>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search by Name, Email, Mobile"
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="border border-gray-300 rounded-md text-sm p-1"
            />

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setCurrentPage(1);
                  setFromDate(e.target.value);
                }}
                className="border border-gray-300 rounded-md text-sm p-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setCurrentPage(1);
                  setToDate(e.target.value);
                }}
                className="border border-gray-300 rounded-md text-sm p-1"
              />
            </div>

            <Button variant="default" onClick={handleExport} disabled={!appuser.length || loading}>
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
                    {sortableColumns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer select-none"
                        onClick={() => requestSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig?.key === col.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : null}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">App Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Api Key</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((u, i) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2 text-sm">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="px-4 py-2 text-sm">{u.name || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.email || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.mobile || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.status || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.role || "—"}</td>
                      <td className="px-4 py-2 text-sm">{new Date(u.added_on).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{new Date(u.updated_on).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{u.app_name || "—"}</td>
                      <td className="px-4 py-2 text-sm">{u.api_key || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
              <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} variant="outline">
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

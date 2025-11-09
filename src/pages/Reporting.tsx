import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "../config/api";
import axios from "axios";

export default function Reporting() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedUser, setSelectedUser] = useState("");

  // ✅ Set default date range as today's date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
  }, []);

  // ✅ Hardcoded Dummy Data
  const generateDummyData = () => {
    const today = new Date().toISOString().split("T")[0];
    return [
      { date: today, totalSuccess: 45, totalFailure: 5 },
      { date: "2025-11-08", totalSuccess: 52, totalFailure: 8 },
      { date: "2025-11-07", totalSuccess: 38, totalFailure: 12 },
      { date: "2025-11-06", totalSuccess: 60, totalFailure: 4 },
      { date: "2025-11-05", totalSuccess: 55, totalFailure: 9 },
    ];
  };

  // ✅ Load report data (hardcoded)
  const fetchReport = async () => {
    try {
      setLoading(true);
      const dummy = generateDummyData();

      // Filter by selected date range
      const filtered = dummy.filter((item) => {
        const itemDate = new Date(item.date).getTime();
        const fromTime = new Date(fromDate).getTime();
        const toTime = new Date(toDate).getTime();
        return itemDate >= fromTime && itemDate <= toTime;
      });

      setReports(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchReport();
  }, []);

  // ✅ Filter by date
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
    setCurrentPage(1);
    fetchReport();
  };

  // ✅ Export to CSV
  const handleExport = () => {
    if (!reports.length) {
      toast.error("No data to export");
      return;
    }

    const csvContent = [
      Object.keys(reports[0]).join(","), // Header
      ...reports.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report exported successfully");
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Layout>
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Reporting</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User/Customer Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-2"
            >
              <option value="">Select Type</option>
              <option value="user">User</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* From Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-1"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-1"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleDateFilter}
            disabled={loading}
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {loading ? "Loading..." : "Submit"}
          </Button>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Export CSV
          </Button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto mt-4 border rounded-lg shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                {reports.length > 0 &&
                  Object.keys(reports[0]).map((key) => (
                    <th key={key} className="p-2 border">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentItems.length > 0 ? (
                currentItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="p-2 border text-center">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={reports[0] ? Object.keys(reports[0]).length : 1}
                    className="text-center p-4 text-gray-500"
                  >
                    {loading ? "Loading data..." : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

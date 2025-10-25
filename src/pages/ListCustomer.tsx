import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";

export default function CustomerFileUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { getUserDetails } = useAuth();

  const dummyData = [
    {
      id: 1,
      batch_id: 122,
      primaryEmail: "dummy@example.com",
      Username: "DummyUser",
      password: "******",
      creationId: "DUMMY-001",
      status: "N/A",
      message: "API failed, showing dummy data",
      created_at: "2025-10-23T18:22:49.000Z",
    },
    {
      id: 2,
      batch_id: 123,
      primaryEmail: "backup@example.com",
      Username: "BackupUser",
      password: "******",
      creationId: "DUMMY-002",
      status: "N/A",
      message: "Fallback record",
      created_at: "2025-10-22T16:11:45.000Z",
    },
  ];

  const fetchCustomer = async () => {
    setLoading(true);

    try {
      const user = getUserDetails();
      const token = user?.token;

      if (!token) {
        toast.error("No valid token found. Please log in again.");
        setUploads(dummyData);
        return;
      }

      const url = `${API_BASE_URL}/list/customers`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(url, { headers });
      setUploads(data?.length ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
      toast.error("Failed to fetch customers, showing dummy data");
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(uploads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = uploads.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Customers</h1>
        </div>

        {loading && (
          <div className="text-center text-gray-500 py-4">Loading customers...</div>
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
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">maxUnits</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch Id</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Customer Id</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status Code</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Response</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((u, i) => {
                    let [domain, maxUnits, batch_id, customerId] = ["", "", "", ""];
                    try {
                      const reqBody = JSON.parse(u.request_body || "{}");
                      domain = reqBody.domain || "";
                      maxUnits = reqBody.maxUnits || "";
                      batch_id = reqBody.batch_id || "";
                      customerId = reqBody.customerId || "";
                    } catch (err) {
                      console.error("Invalid JSON in request_body", err);
                    }

                    const responseText = u.status_code === 200 ? "ok" : u.response_body;

                    return (
                      <tr key={u.id}>
                        <td className="px-4 py-2 text-sm">{startIndex + i + 1}</td>
                        <td className="px-4 py-2 text-sm">{u.app_name || "—"}</td>
                        <td className="px-4 py-2 text-sm">{domain || "—"}</td>
                        <td className="px-4 py-2 text-sm">{maxUnits || "—"}</td>
                        <td className="px-4 py-2 text-sm">{batch_id || "—"}</td>
                        <td className="px-4 py-2 text-sm">{customerId || "—"}</td>
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  variant="outline"
                >
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
                    setCurrentPage(1); // reset to first page
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

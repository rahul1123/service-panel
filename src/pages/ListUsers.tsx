import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import CustomerFileModel from "@/components/modals/CustomerFileModel";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CustomerFileUploads() {
  const [user, setUser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { getUserDetails } = useAuth();

  // Dummy fallback data
  const dummyData = [
    {
      id: 1,
      batch_id: 122,
      primaryEmail: "dummy@example.com",
      Username: "DummyUser",
      password: "******",
      creationId: "DUMMY-001",
      status: "Failed to fetch",
      message: "Showing fallback data",
      created_at: "2025-10-23T18:22:49.000Z",
    },
  ];

  // 🟢 Fetch all users
  const fetchUser = async () => {
    setLoading(true);
    try {
      const userDetails = getUserDetails();
      const token = userDetails?.token;

      if (!token) {
        toast.error("No valid token found. Please log in again.");
       // setUser(dummyData);
        return;
      }

      const url = `${API_BASE_URL}/list/users`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.get(url, { headers });
      console.log("User list response:", data);

      setUser(data?.length ? data : []);
    } catch (err) {
      console.error("Failed to fetch users, showing dummy data", err);
      toast.error("Failed to fetch users, showing dummy data");
      setUser([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🧮 Pagination logic
  const totalPages = Math.ceil(user.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = user.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };

  // Helper for visible page numbers (max 5 buttons)
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

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List Users</h1>
        </div>

        {/* Modal */}
        <CustomerFileModel
          open={isModalOpen}
          setOpen={setIsModalOpen}
          fetchFileUploads={fetchUser}
          editingFileUpload={null}
          setEditingFileUpload={() => {}}
        />

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading users...</div>
        ) : (
          <>
            {user.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Primary Email</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch ID</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Message</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((file, index) => (
                        <tr key={file.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {file.primaryEmail}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {file.Username}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {file.batch_id || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {file.message || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(file.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
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

                  {/* Page size selector */}
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
          </>
        )}
      </div>
    </Layout>
  );
}

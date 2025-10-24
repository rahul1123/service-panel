import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import CustomerFileModel from "@/components/modals/CustomerFileModel";
import { API_BASE_URL } from "../config/api";

export default function CustomerFileUploads() {
  const [user, setUser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const url = `${API_BASE_URL}/list/users`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjUsImVtYWlsIjoiYWRtaW5AcGFuZWwuY29tIiwiaWF0IjoxNzYxMjM4Njk2LCJleHAiOjE3NjEyNjc0OTZ9.kwaj-qMiWNyk8dcNC86eKdEFMMJwde-3K5hoYIu04Z8",
      };

      const { data } = await axios.get(url, { headers });
      console.log("Customer list response:", data);

      setUser(data.result || dummyData);
    } catch (err) {
      console.error("Failed to fetch customers, showing dummy data", err);
      setUser(dummyData); // 👈 Set dummy data if API fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">List User</h1>
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
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Primary Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Batch ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Message</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {user.map((file, index) => (
                <tr key={file.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.primaryEmail}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.Username}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.batch_id || "N/A"}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.status || "N/A"}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{file.message || "N/A"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading message */}
        {loading && (
          <div className="text-center text-gray-500 py-4">Loading users...</div>
        )}
      </div>
    </Layout>
  );
}

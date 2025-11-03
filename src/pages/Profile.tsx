import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import axios from "axios";

export default function CustomerFileUploads() {
  const { getUserDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiPassword, setShowApiPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
     const [isEditing, setIsEditing] = useState(false);

 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    app_name: "",
    api_key: "",
    api_username: "",
    api_password: "",
    services: "",
    status: "active",
    role: "customer",
    id:""
  });

  useEffect(() => {
    const user = getUserDetails();
    if (user && user.userInfo && user.userInfo.length > 0) {
      const info = user.userInfo[0];
      setFormData((prev) => ({
        ...prev,
        name: info.name || "",
        email: info.email || "",
        mobile: info.mobile || "",
        api_key: info.api_key || "",
        api_username: info.api_username || "",
        api_password: info.api_password, // Hardcoded as per your example
        password: info.password || "",
        status: info.status || "active",
        role: info.role || "customer",
        id: info.id?.toString() || "",
      }));
    }
  }, [getUserDetails]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleProfileUpdate = async () => {
  
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.patch(
        `${API_BASE_URL}/profile/update/${formData.id}`,
        {
          name: formData.name,
          password: formData.password,
          api_username: formData.api_username,
          api_password: formData.api_password,
          user_id:formData.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": "f7ab26185b14fc87db613850887be3b8",
          },
        }
      );

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 relative">
        {/* Header with status and role */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">
            Profile Information
          </h1>

          <div className="flex items-center space-x-4">
            {/* Status */}
            <div className="flex items-center space-x-1">
              {formData.status === "active" ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Active
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium">
                  Inactive
                </span>
              )}
            </div>

            {/* Role */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                formData.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {formData.role.charAt(0).toUpperCase() +
                formData.role.slice(1)}
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            readOnly
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            readOnly
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block text-sm font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            readOnly={!isEditingPassword}
            className={`w-full border rounded-md p-2 pr-10 ${
              isEditingPassword ? "" : "bg-gray-100"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>


        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            readOnly
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium">API Key</label>
          <input
            type="text"
            name="api_key"
            value={formData.api_key}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            readOnly
          />
        </div>

        {/* API Username */}
        <div>
          <label className="block text-sm font-medium">API Username</label>
          <input
            type="text"
            name="api_username"
            value={formData.api_username}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            readOnly
          />
        </div>

        {/* API Password with eye button */}
        <div className="relative">
          <label className="block text-sm font-medium">API Password</label>
          <input
            type={showApiPassword ? "text" : "password"}
            name="api_password"
            value={formData.api_password}
            onChange={handleChange}
            readOnly
            className="w-full border rounded-md p-2 pr-10 bg-gray-100"
          />
          <button
            type="button"
            onClick={() => setShowApiPassword((prev) => !prev)}
            className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showApiPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        
      <button
  onClick={handleProfileUpdate}
  disabled={loading}
  className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md text-sm"
>
  {loading ? "Updating..." : "Update"}
</button>
        </div>
      </div>
    </Layout>
  );
}

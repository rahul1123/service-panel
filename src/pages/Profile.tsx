import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerFileUploads() {
  const { getUserDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const serviceOptions: Record<string, string> = {
    "API CONSUMER Services":
      "/api/v1/login,/api/v1/create/reseller/customer,/api/v1/create/customer/users,/api/v1/update/customer/users,/api/v1/customer/details,/api/v1/list/customer/users",
    "PANEL Customer Services":
      "/api/v1/panel/login,/api/v1/panel/customer/upload,/api/v1/panel/user/upload,/api/v1/panel/customer/create",
    "All Services":
      "/api/v1/login,/api/v1/create/reseller/customer,/api/v1/create/customer/users,/api/v1/update/customer/users,/api/v1/customer/details,/api/v1/list/customer/users,/api/v1/panel/login,/api/v1/panel/customer/upload,/api/v1/panel/user/upload,/api/v1/panel/customer/create",
  };

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
        api_password: info.api_password || "",
        status: info.status || "active",
        role: info.role || "customer",
      }));
    }
  }, [getUserDetails]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleServiceTypeChange = (e: any) => {
    const value = e.target.value;
    setSelectedServiceType(value);
    setFormData({ ...formData, services: serviceOptions[value] || "" });
    setErrors({ ...errors, services: "" });
  };

  const handlePasswordUpdate = async () => {
    if (!formData.password) {
      setErrors({ password: "Password cannot be empty" });
      return;
    }

    try {
      setLoading(true);

      //update the user password call  api end 
      // TODO: Replace this with your actual API call to update password
      console.log("Updating password:", formData.password);
      alert("Password updated successfully!");
      setIsEditingPassword(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 relative">
        <h1 className="text-2xl font-bold text-slate-800">Profile Information</h1>

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

        {/* Password (editable with eye icon) */}
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
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {!isEditingPassword ? (
            <button
              type="button"
              onClick={() => setIsEditingPassword(true)}
              className="text-sm text-blue-600 mt-2 hover:underline"
            >
              Change Password
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <button
                onClick={handlePasswordUpdate}
                disabled={loading}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
              >
                {loading ? "Updating..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditingPassword(false)}
                className="px-3 py-1 bg-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

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

        {/* API Password */}
        <div>
          <label className="block text-sm font-medium">API Password</label>
          <input
            type="password"
            name="api_password"
            value={formData.api_password}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            readOnly
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </Layout>
  );
}

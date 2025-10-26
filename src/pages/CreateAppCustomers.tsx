import Layout from "@/components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "@/context/AuthContext";

export default function CustomerFileUploads() {
  const { getUserDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedServiceType, setSelectedServiceType] = useState("");

  const serviceOptions: Record<string, string> = {
    "API CONSUMER Services":
      "/api/v1/login,/api/v1/create/reseller/customer,/api/v1/create/customer/users,/api/v1/update/customer/users,/api/v1/customer/details,/api/v1/list/customer/users",
    "PANEL Customer Services":
      "/api/v1/panel/login,/api/v1/panel/customer/upload,/api/v1/panel/user/upload,/api/v1/panel/customer/create",
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
    role: "admin",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required.";
    if (!formData.app_name.trim()) newErrors.app_name = "App name is required.";
    if (!formData.api_key.trim()) newErrors.api_key = "API key is required.";
    if (!formData.services.trim()) newErrors.services = "Please select a service type.";
    return newErrors;
  };

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const user = getUserDetails();
      const token = user?.token;

      if (!token) {
        toast.error("No valid token found. Please log in again.");
        return;
      }

      await axios.post(`${API_BASE_URL}/admin/create/app`, formData, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": formData.api_key,
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("App user created successfully!");
      setFormData({
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
        role: "admin",
      });
      setSelectedServiceType("");
      setErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create app user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Create App User</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
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
            />
            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
          </div>

          {/* App Name */}
          <div>
            <label className="block text-sm font-medium">App Name</label>
            <input
              type="text"
              name="app_name"
              value={formData.app_name}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
            {errors.app_name && <p className="text-red-500 text-sm">{errors.app_name}</p>}
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
            />
            {errors.api_key && <p className="text-red-500 text-sm">{errors.api_key}</p>}
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
            />
          </div>

          {/* API Password */}
          <div>
            <label className="block text-sm font-medium">API Password</label>
            <input
              type="text"
              name="api_password"
              value={formData.api_password}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Services Dropdown */}
          <div className="col-span-2">
            <label className="block text-sm font-medium">Select Service Type</label>
            <select
              value={selectedServiceType}
              onChange={handleServiceTypeChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">-- Select Service Type --</option>
              {Object.keys(serviceOptions).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {errors.services && (
              <p className="text-red-500 text-sm mt-1">{errors.services}</p>
            )}

            {/* Show selected service list only after choosing */}
            {selectedServiceType && formData.services && (
              <textarea
                value={formData.services}
                readOnly
                rows={3}
                className="w-full border rounded-md p-2 mt-2 bg-gray-50 text-sm"
              />
            )}
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
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          {/* Submit */}
          <div className="col-span-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create App User"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

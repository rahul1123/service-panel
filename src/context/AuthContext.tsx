import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../config/api";

type UserDetails = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

interface AuthContextType {
  user: UserDetails | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getUserRoles: () => string[];
  getUserDetails: () => UserDetails | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: true,
  getUserRoles: () => [],
  getUserDetails: () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      type DecodedToken = {
        id: number;
        name: string;
        email: string;
        role?: string | string[];
        "cognito:groups"?: string[] | string;
      };

      // Define possible API responses
      type SuccessResponse = { status: true; token: string };
      type ErrorResponse = { status: false; code: string; error: string };
      type ApiResponse = SuccessResponse | ErrorResponse;

      // Type guard to narrow success case
      const isSuccessResponse = (
        response: ApiResponse
      ): response is SuccessResponse => response.status === true;

      //comment the login 

      //    const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
      //   email,
      //   password,
      // });
      // const { accessToken} = response.data;

      // ===== sucess response with dummy data =====
      // const response: ApiResponse = {
      //   status: true,
      //   token:
      //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwibmFtZSI6IkFkbWluIFVzZXIiLCJlbWFpbCI6ImFkbWluQHBhbmVsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MTIyMzc2NiwiZXhwIjoxNzYxMjUyNTY2fQ.cGBPy7JFH1LrhZ4PhQHmDFtwLfTZaCi-WqQcdHjVK9A",
      // };

      // failed login Response
      const response: ApiResponse = {
        status: false,
        code: "4003",
        error: "Invalid username or password",
      };

      // ✅ Safe narrowing
      if (!isSuccessResponse(response)) {
        throw new Error(response.error || "Login failed. Please try again.");
      }

      // ✅ Now TypeScript knows token exists
      const accessToken = response.token;
      localStorage.setItem("accessToken", accessToken);

      const decoded: DecodedToken = jwtDecode(accessToken);
      console.log("Decoded token:", decoded);

      // Normalize roles
      let userRoles: string[] = [];
      if (Array.isArray(decoded["cognito:groups"])) {
        userRoles = decoded["cognito:groups"];
      } else if (typeof decoded["cognito:groups"] === "string") {
        userRoles = [decoded["cognito:groups"]];
      } else if (typeof decoded.role === "string") {
        userRoles = [decoded.role];
      } else if (Array.isArray(decoded.role)) {
        userRoles = decoded.role;
      }

      const userData: UserDetails = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        roles: userRoles,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(error.message || "Invalid credentials");
    }
  };

  const getUserRoles = (): string[] => {
    const token = localStorage.getItem("accessToken");
    if (!token) return [];

    try {
      const decoded: any = jwtDecode(token);
      let roles: string[] = [];

      if (Array.isArray(decoded["cognito:groups"])) {
        roles = decoded["cognito:groups"];
      } else if (typeof decoded["cognito:groups"] === "string") {
        roles = [decoded["cognito:groups"]];
      } else if (typeof decoded.role === "string") {
        roles = [decoded.role];
      } else if (Array.isArray(decoded.role)) {
        roles = decoded.role;
      }

      return roles;
    } catch (err) {
      console.error("Token decode error", err);
      return [];
    }
  };

  const getUserDetails = (): UserDetails | null => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      const roles = getUserRoles();
      return {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        roles,
      };
    } catch (err) {
      console.error("Token decode error", err);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, getUserRoles, getUserDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

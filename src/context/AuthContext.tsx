import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../config/api";

type UserDetails = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  token: string;
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

let logoutTimer: NodeJS.Timeout | null = null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 🧠 Helper to schedule auto logout when token expires
  const scheduleLogout = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000; // convert to ms
      const currentTime = Date.now();
      const remainingTime = exp - currentTime;

      if (remainingTime > 0) {
        if (logoutTimer) clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
          console.warn("Token expired — auto logging out");
          logout();
          alert("Session expired. Please log in again.");
        }, remainingTime);
      } else {
        logout(); // if already expired
      }
    } catch (err) {
      console.error("Error scheduling logout:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      scheduleLogout(token);
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
        exp: number;
      };

      type SuccessResponse = { status: true; token: string };
      type ErrorResponse = { status: false; code: string; error: string };
      type ApiResponse = SuccessResponse | ErrorResponse;

      const isSuccessResponse = (
        response: ApiResponse
      ): response is SuccessResponse => response.status === true;

      const url = `${API_BASE_URL}/login`;
      const headers = {
        "x-api-key": "f7ab26185b14fc87db613850887be3b8",
        "Content-Type": "application/json",
      };

      const { data } = await axios.post<ApiResponse>(
        url,
        { email, password },
        { headers }
      );

      if (!isSuccessResponse(data)) {
        throw new Error(data.error || "Login failed. Please try again.");
      }

      const accessToken = data.token;
      localStorage.setItem("accessToken", accessToken);

      const decoded: DecodedToken = jwtDecode(accessToken);

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
        token: accessToken,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Set auto logout when login succeeds
      scheduleLogout(accessToken);
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

  const getUserDetails = (): (UserDetails & { token: string }) | null => {
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
        token,
      };
    } catch (err) {
      console.error("Token decode error", err);
      return null;
    }
  };

  const logout = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login"; // optional redirect
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

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../config/api";
import { decode } from "punycode";

type UserDetails = {
  id:number;
  name: string;
  email: string;
  roles: string[];
};

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getUserRoles: () => string[]; 
  getUserDetails:() => UserDetails | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { },
  logout: () => { },
  loading: true,
  getUserRoles: () => [],
  getUserDetails:  () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
   
  //     const decoded: any = jwtDecode(savedUser);
  //     console.log(decoded,'decode')
  // const expiry = decoded.exp * 1000; // convert to ms
  // const now = Date.now();
  // const remaining = expiry - now;
  //   console.log(savedUser,'saveduse')
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {

    try {
      type DecodedToken = {
        "cognito:groups"?: string[];
        email: string;
        name: string;
        id:number;
      };
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password,
      });
      const { accessToken} = response.data;

      localStorage.setItem("accessToken", accessToken);  
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        console.log(decoded,'decoded')
        const userRoles = decoded["cognito:groups"] || [];
        console.log("User Roles:", userRoles);
      }
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials");
    }
  };

  const getUserRoles = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return [];
  try {
    const decoded: any = jwtDecode(token);
    console.log(decoded,'getuserroles')
    // return decoded["cognito:groups"] || [];
   return  decoded.role
  } catch (err) {
    console.error("Token decode error", err);
    return [];
  }
};

const getUserDetails = (): UserDetails | null => {
  const token = localStorage.getItem("idToken");
  const recruiterId = Number(localStorage.getItem("recruiter_id"));
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    console.log(decoded,'decoded')
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      roles: decoded["cognito:groups"] || [],
    };
  } catch (err) {
    console.error("Token decode error", err);
    return null;
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Clear tokens and session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getUserRoles,getUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { lazy, Suspense } from "react";
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Resellers = lazy(() => import("./pages/Resellers"));
const Users = lazy(() => import("./pages/Users"));
const Customers = lazy(() => import("./pages/Customer"));
const ListUsers = lazy(() => import("./pages/ListUsers"));
const ListCustomers = lazy(() => import("./pages/ListCustomer"));
const CreateAppCustomers = lazy(() => import("./pages/CreateAppCustomers"));
const ListAppUsers = lazy(() => import("./pages/ListAppUsers"));
const Applications = lazy(() => import("./pages/Application"));
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <AuthProvider>
          <BrowserRouter>
          <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
           
              <Route
                path="/upload-users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-customers"
                element={
                  <ProtectedRoute>
                    <Customers/>
                  </ProtectedRoute>
                }
              />
                <Route
                path="/list-users"
                element={
                  <ProtectedRoute>
                    <ListUsers/>
                  </ProtectedRoute>
                }
              />
                <Route
                path="/list-customers"
                element={
                  <ProtectedRoute>
                    <ListCustomers/>
                  </ProtectedRoute>
                }
              />

                 <Route
                path="/list-app-user"
                element={
                  <ProtectedRoute>
                    <ListAppUsers/>
                  </ProtectedRoute>
                }
              />

                 <Route
                path="/create-app-customer"
                element={
                  <ProtectedRoute>
                    <CreateAppCustomers/>
                  </ProtectedRoute>
                }
              />

              

              
              

              
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
 
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;

import React from "react";
import { Navigate } from "react-router-dom";

export default function UnprotectedRoute({ children, unprotected = false }) {
  // Get authentication details from sessionStorage
  const authData = JSON.parse(localStorage.getItem("auth"));
  const isAuthenticated = authData?.authenticated || false;
  const userRole = authData?.user?.role;

  if (unprotected || !isAuthenticated) {
    return children; // Allow unauthenticated users to access
  }

  // Redirect authenticated users based on their role
  if (userRole === "Admin") return <Navigate to="/admin" replace />;
  if (userRole === "PharmacyOwner") return <Navigate to="/pharmacy-owner" replace />;
  if (userRole === "Customer") return <Navigate to="/customer" replace />;

  return <Navigate to="/" replace />; // Fallback
}

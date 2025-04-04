import React from "react";
import { Navigate } from "react-router-dom";

export default function UnprotectedRoute({ children, unprotected = false }) {
  const authData = JSON.parse(localStorage.getItem("auth"));
  const isAuthenticated = authData?.authenticated || false;
  const userRole = authData?.user?.role;

  // Restore last visited page on refresh
  const lastVisitedPath = localStorage.getItem("lastVisitedPath");

  if (unprotected || !isAuthenticated) {
    return children; // Allow unauthenticated users
  }

  // Redirect to last visited path if available
  if (lastVisitedPath) return <Navigate to={lastVisitedPath} replace />;

  // Otherwise, redirect based on role
  if (userRole === "Admin") return <Navigate to="/admin" replace />;
  if (userRole === "PharmacyOwner") return <Navigate to="/pharmacy-owner" replace />;
  if (userRole === "Customer") return <Navigate to="/customer" replace />;

  return <Navigate to="/" replace />;
}

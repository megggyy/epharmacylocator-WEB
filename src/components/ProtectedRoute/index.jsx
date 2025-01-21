import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, userRoles = [] }) {
  const location = useLocation();

  // Get authentication details from sessionStorage
  const authData = JSON.parse(localStorage.getItem("auth"));
  const isAuthenticated = authData?.authenticated || false;
  const userRole = authData?.user?.role;

  const isNotAuthorized =
    !isAuthenticated || // User is not authenticated
    (userRoles.length > 0 && !userRoles.includes(userRole)); // Role mismatch

  return isNotAuthorized ? (
    <Navigate to="/login" state={{ from: location }} replace />
  ) : (
    children
  );
}

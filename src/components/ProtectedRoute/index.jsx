import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, userRoles = [] }) {
  const location = useLocation();

  useEffect(() => {
    // Save the last visited path in sessionStorage
    localStorage.setItem("lastVisitedPath", location.pathname);
  }, [location]);

  // Get authentication details
  const authData = JSON.parse(localStorage.getItem("auth"));
  const isAuthenticated = authData?.authenticated || false;
  const userRole = authData?.user?.role;

  const isNotAuthorized =
    !isAuthenticated || (userRoles.length > 0 && !userRoles.includes(userRole));

  return isNotAuthorized ? (
    <Navigate to="/login" state={{ from: location }} replace />
  ) : (
    children
  );
}

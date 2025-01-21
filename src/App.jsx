
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { RootLayout, NotFound, Welcome, HomeLayoutBlock, AdminLayout } from "@/layouts";
import { useMediaQuery } from "react-responsive";
import { MobileChecker, UnprotectedRoute, ProtectedRoute } from "@components";

// pages
import Pharmacies from "./pages/Pharmacies";
import Medicines from "./pages/Medicines";
import Maps from "./pages/Maps";
import PharmacyDetails from "./pages/PharmacyDetails";
import MedicationDetails from "./pages/MedicationDetails";
import RoleSelectionScreen from "./pages/SignUpRole";
import CustomerSignup from "./pages/CustomerSignUp";
import PharmacyOwnerSignupScreen from "./pages/PharmacyOwnerSignUp";
import LoginScreen from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import { AuthProvider } from "./context/AuthGlobal";

const MOBILE_BREAKPOINT = 767;
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route element={<HomeLayoutBlock />}>
        <Route index element={<Welcome />} />
        <Route
          path="pharmacies"
          element={
            <UnprotectedRoute>
              <Pharmacies />
            </UnprotectedRoute>
          }
        />
        <Route
          path="medicines"
          element={
            <UnprotectedRoute>
              <Medicines />
            </UnprotectedRoute>
          }
        />
        <Route
          path="maps"
          element={
              <Maps />
          }
        />
        <Route
          path="PharmacyDetails/:id"
          element={
            <UnprotectedRoute>
              <PharmacyDetails />
            </UnprotectedRoute>
          }
        />
         <Route
          path="MedicationDetails/:name"
          element={
            <UnprotectedRoute>
              <MedicationDetails />
            </UnprotectedRoute>
          }
        />
         <Route
          path="SignUpRole"
          element={
            <UnprotectedRoute>
              <RoleSelectionScreen />
            </UnprotectedRoute>
          }
        />
         <Route
          path="CustomerSignup"
          element={
            <UnprotectedRoute>
              <CustomerSignup />
            </UnprotectedRoute>
          }
        />
        <Route
          path="PharmacyOwnerSignUp"
          element={
            <UnprotectedRoute>
              <PharmacyOwnerSignupScreen />
            </UnprotectedRoute>
          }
        />
        <Route
          path="login"
          element={
            <UnprotectedRoute>
              <LoginScreen />
            </UnprotectedRoute>
          }
        />
      </Route>
      {/* Customer Routes */}
      <Route path="customer" element={<HomeLayoutBlock />}>
        <Route
          index
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacies"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <Pharmacies />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicines"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <Medicines />
            </ProtectedRoute>
          }
        />
        <Route
          path="maps"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <Maps />
            </ProtectedRoute>
          }
        />
        <Route
         path="PharmacyDetails/:id"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <PharmacyDetails />
            </ProtectedRoute>
          }
        />
        <Route
         path="MedicationDetails/:name"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <MedicationDetails />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
      <Route
          index
          element={
            <ProtectedRoute userRole={["Admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_BREAKPOINT });
  return (
    <>
    <AuthProvider>
      {isMobile ? (
        <MobileChecker />
      ) : (
        <RouterProvider router={router} />
      )}
      </AuthProvider>
    </>
  );
}

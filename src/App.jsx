
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { RootLayout, NotFound, Welcome, HomeLayoutBlock, AdminLayout, CustomerLayout } from "@/layouts";
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
import CustomerWelcome from "./layouts/CustomerWelcome";

// customer pages
import CustomerPharmacies from "./pages/Customer/Pharmacies";
import CustomerMedicines from "./pages/Customer/Medicines";
import CustomerMaps from "./pages/Customer/Maps";
import CustomerPharmacyDetails from "./pages/Customer/PharmacyDetails";
import CustomerMedicationDetails from "./pages/Customer/MedicationDetails";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard";
import MedicationCategoriesScreen from "./pages/Admin/MedicineCategories/allMedicineCategories";
import BarangaysScreen from "./pages/Admin/Barangays/allBarangays";
import UserTableScreen from "./pages/Admin/Users/allUsers";
import PharmaciesScreen from "./pages/Admin/Pharmacies/allPharmacies";

// Pharmacy Owner pages


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
      <Route path="customer" element={<CustomerLayout />}>
        <Route
          index
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerWelcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacies"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerPharmacies />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicines"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerMedicines />
            </ProtectedRoute>
          }
        />
        <Route
          path="maps"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerMaps />
            </ProtectedRoute>
          }
        />
        <Route
         path="PharmacyDetails/:id"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerPharmacyDetails />
            </ProtectedRoute>
          }
        />
        <Route
         path="MedicationDetails/:name"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerMedicationDetails />
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
        <Route
          path="medication-category"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <MedicationCategoriesScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="barangays"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <BarangaysScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <UserTableScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacies"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <PharmaciesScreen />
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

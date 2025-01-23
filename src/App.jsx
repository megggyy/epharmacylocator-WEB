
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { RootLayout, NotFound, Welcome, HomeLayoutBlock, AdminLayout, CustomerLayout } from "@/layouts";
import { useMediaQuery } from "react-responsive";
import { MobileChecker, UnprotectedRoute, ProtectedRoute } from "@components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import CreateCategory from "./pages/Admin/MedicineCategories/createMedicineCategory";
import EditCategory from "./pages/Admin/MedicineCategories/editMedicineCategory";
import ReadCategory from "./pages/Admin/MedicineCategories/readMedicineCategory";
import BarangaysScreen from "./pages/Admin/Barangays/allBarangays";
import CreateBarangay from "./pages/Admin/Barangays/createBarangays";
import EditBarangay from "./pages/Admin/Barangays/editBarangays";
import ReadBarangayScreen from "./pages/Admin/Barangays/readBarangays";
import UserTableScreen from "./pages/Admin/Users/allUsers";
import ReadUserScreen from "./pages/Admin/Users/readUsers";
import PharmaciesScreen from "./pages/Admin/Pharmacies/allPharmacies";
import ReadPharmacyScreen from "./pages/Admin/Pharmacies/readPharmacy";

// Pharmacy Owner pages


import { AuthProvider } from "./context/AuthGlobal";

const MOBILE_BREAKPOINT = 767;
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route element={<HomeLayoutBlock />}>
        <Route index element={<UnprotectedRoute><Welcome /></UnprotectedRoute>} />
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
          path="medication-category/create"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <CreateCategory />
            </ProtectedRoute>
          }
        />
        <Route
        path="medication-category/edit/:id"
        element={
          <ProtectedRoute userRoles={["Admin"]}>
            <EditCategory />
          </ProtectedRoute>
        }
      />
       <Route
        path="medication-category/read/:id"
        element={
          <ProtectedRoute userRoles={["Admin"]}>
            <ReadCategory />
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
          path="barangays/create"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <CreateBarangay />
            </ProtectedRoute>
          }
        />
      <Route
        path="barangays/edit/:id"
        element={
          <ProtectedRoute userRoles={["Admin"]}>
            <EditBarangay />
          </ProtectedRoute>
        }
      />
      <Route
        path="barangays/read/:id"
        element={
          <ProtectedRoute userRoles={["Admin"]}>
            <ReadBarangayScreen />
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
        path="users/read/:id"
        element={
          <ProtectedRoute userRoles={["Admin"]}>
            <ReadUserScreen />
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
        <Route
        path="pharmacies/read/:id"
        element={
          <ProtectedRoute userRoles={["Admin"]}>
            <ReadPharmacyScreen />
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
    <ToastContainer />
      {isMobile ? (
        <MobileChecker />
      ) : (
        <RouterProvider router={router} />
      )}
      </AuthProvider>
    </>
  );
}

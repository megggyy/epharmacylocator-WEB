
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { RootLayout, NotFound, Welcome, HomeLayoutBlock, AdminLayout, CustomerLayout, PharmacyOwnerLayout } from "@/layouts";
import { useMediaQuery } from "react-responsive";
import { MobileChecker, UnprotectedRoute, ProtectedRoute } from "@components";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthGlobal";
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
import PharmacyStatus from "./pages/PharmacyStatus";
import CategoryFilterMedications from "./pages/FilterMedicineByCategory";

// customer pages
import CustomerPharmacies from "./pages/Customer/Pharmacies";
import CustomerMedicines from "./pages/Customer/Medicines";
import CustomerMaps from "./pages/Customer/Maps";
import CustomerPharmacyDetails from "./pages/Customer/PharmacyDetails";
import CustomerMedicationDetails from "./pages/Customer/MedicationDetails";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import PrescriptionScan from "./pages/PrescriptionScan";
import PrescriptionResultsScreen from "./pages/PrescriptionResults";
import CustomerViewProfile from "./pages/Customer/Profile/viewProfile";
import CustomerEditProfile from "./pages/Customer/Profile/editProfile";
import CustomerChangePasswordScreen from "./pages/Customer/Profile/changePassword";
import CustomerCategoryFilterMedications from "./pages/Customer/FilterMedicineByCategory";
import ViewPharmacyMedicine from "./pages/Customer/ViewPharmacyMedicine";
import FilterMedicinesByCategoryPerPharmacy from "./pages/Customer/FilterMedicineByCategoryPerPharmacy";

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
import AdminScreen from "./pages/Admin/Admins/allAdmins";

import ReadUserScreen from "./pages/Admin/Users/readUsers";
import PharmaciesScreen from "./pages/Admin/Pharmacies/allPharmacies";
import ReadPharmacyScreen from "./pages/Admin/Pharmacies/readPharmacy";

import LicensedPharmacies from "./pages/Admin/LicensedPharmacies/licensedPharmacies";

import MedicinePieChart from "./pages/Admin/Charts/MedicinesPerCategory";
import PharmacyBarChart from "./pages/Admin/Charts/PharmaciesPerBarangay";
import MonthlyPharmacyRegistrationChart from "./pages/Admin/Charts/MonthlyPharmacyRegistration";
import SummaryOfReports from "./pages/Admin/SummaryOfReports";
import AdminViewProfile from "./pages/Admin/Profile/AdminViewProfile";
import AdminEditProfile from "./pages/Admin/Profile/AdminEditProfile";
import AdminChangePasswordScreen from "./pages/Admin/Profile/AdminChangePassword";

import AdminMedicationScreen from "./pages/Admin/Medicines/allMedicines";
import AdminReadMedicationScreen from "./pages/Admin/Medicines/readMedicine";



// Pharmacy Owner pages
import PharmacyOwnerDashboard from "./pages/PharmacyOwner/PharmacyOwnerDashboard";
import MedicationScreen from "./pages/PharmacyOwner/Medicines/allMedicines";
import CreateMedicines from "./pages/PharmacyOwner/Medicines/createMedicine";
import OwnerViewProfile from "./pages/PharmacyOwner/Profile/pharmacyViewProfile";
import OwnerEditProfile from "./pages/PharmacyOwner/Profile/pharmacyEditProfile";
import PharmacyChangePasswordScreen from "./pages/PharmacyOwner/Profile/pharmacyChangePassword";
import EditMedicationScreen from "./pages/PharmacyOwner/Medicines/editMedicine";
import ReadMedicationScreen from "./pages/PharmacyOwner/Medicines/readMedicine";

import ExpiringMedicationScreen from "./pages/PharmacyOwner/Medicines/expiringMedicines";
import ListReviewsScreen from "./pages/PharmacyOwner/Reviews/listReviews";

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
        <Route
          path="pharmacy-status"
          element={
            <UnprotectedRoute>
              <PharmacyStatus />
            </UnprotectedRoute>
          }
        />
        <Route
          path="pharmacy-status"
          element={
            <UnprotectedRoute>
              <PharmacyStatus />
            </UnprotectedRoute>
          }
        />
        <Route
          path="/category/:id/:name"
          element={
            <UnprotectedRoute>
              <CategoryFilterMedications />
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
          path="category/:id/:name"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerCategoryFilterMedications />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacyCategory"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <FilterMedicinesByCategoryPerPharmacy />
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
          path="ViewPharmacyMedicine"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <ViewPharmacyMedicine />
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
        <Route
          path="prescription-upload"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <PrescriptionUpload />
            </ProtectedRoute> 
          }
        />
        <Route
          path="prescription-scan"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <PrescriptionScan />
            </ProtectedRoute> 
          }
        />
        <Route
          path="prescription-results"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <PrescriptionResultsScreen />
            </ProtectedRoute> 
          }
        />
        {/* profile */}
        <Route
          path="viewProfile"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerViewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="editProfile"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="change-password"
          element={
            <ProtectedRoute userRoles={["Customer"]}>
              <CustomerChangePasswordScreen />
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
          path="admins"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <AdminScreen />
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
          <Route
          path="licensedPharmacies"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <LicensedPharmacies />
            </ProtectedRoute>
          }
        />
        {/* Charts */}
        <Route
          path="medicinesPerCategory"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <MedicinePieChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmaciesPerBarangay"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <PharmacyBarChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="monthlyPharmacyRegistrations"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <MonthlyPharmacyRegistrationChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="summaryReports"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <SummaryOfReports />
            </ProtectedRoute>
          }
        />
        {/* Profile */}
        <Route
          path="viewProfile"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <AdminViewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="editProfile"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <AdminEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="changePassword"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <AdminChangePasswordScreen />
            </ProtectedRoute>
          }
        />
         {/* Medicines */}
        <Route
          path="medicines"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <AdminMedicationScreen />
            </ProtectedRoute>
          }
        />
         <Route
          path="medicines/read/:id"
          element={
            <ProtectedRoute userRoles={["Admin"]}>
              <AdminReadMedicationScreen />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="pharmacy-owner" element={<PharmacyOwnerLayout />}>
        <Route
          index
          element={
            <ProtectedRoute userRole={["PharmacyOwner"]}>
              <PharmacyOwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicines"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <MedicationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicines/create"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <CreateMedicines />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicines/edit/:id"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <EditMedicationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="medicines/read/:id"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <ReadMedicationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="expiringMedicines"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <ExpiringMedicationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="listReviews"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <ListReviewsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="viewProfile"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <OwnerViewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="editProfile"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <OwnerEditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="change-password"
          element={
            <ProtectedRoute userRoles={["PharmacyOwner"]}>
              <PharmacyChangePasswordScreen />
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

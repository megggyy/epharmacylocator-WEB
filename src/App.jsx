
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { RootLayout, NotFound, Welcome, HomeLayoutBlock } from "@/layouts";
import { useMediaQuery } from "react-responsive";
import { MobileChecker } from "@components";
// pages
import Pharmacies from "./pages/Pharmacies";
import Medicines from "./pages/Medicines";
import Maps from "./pages/Maps";
import PharmacyDetails from "./pages/PharmacyDetails";
import MedicationDetails from "./pages/MedicationDetails";

const MOBILE_BREAKPOINT = 767;
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route element={<HomeLayoutBlock />}>
        <Route index element={<Welcome />} />
        <Route
          path="pharmacies"
          element={
              <Pharmacies />
          }
        />
        <Route
          path="medicines"
          element={
              <Medicines />
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
              <PharmacyDetails />
          }
        />
         <Route
          path="MedicationDetails/:name"
          element={
              <MedicationDetails />
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
      {isMobile ? (
        <MobileChecker />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}

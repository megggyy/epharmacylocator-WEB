import React from "react";
import { PharmacyOwnerNavbar, PharmacyOwnerSidebar, Footer } from "@components";
import { Outlet } from "react-router-dom";

const PharmacyOwnerLayout = () => {
  return (
    <div className="bg-white-100">
    <PharmacyOwnerSidebar />
    <div className="relative md:ml-64 bg-blueGray-100">
      <PharmacyOwnerNavbar />
      <div className="mx-auto w-full">
        <Outlet />
      </div>
    </div>
  </div>
  );
};

export default PharmacyOwnerLayout;

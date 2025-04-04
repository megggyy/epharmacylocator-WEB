import React from "react";
import { AdminNavbar, AdminSidebar, Footer } from "@components";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="bg-white-100">
    <AdminSidebar />
    <div className="relative md:ml-64 bg-blueGray-100">
      <AdminNavbar />
      <div className="mx-auto w-full">
        <Outlet />
      </div>
    </div>
  </div>
  );
};

export default AdminLayout;

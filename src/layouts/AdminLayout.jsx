import React from "react";
import { AdminNavbar, Sidebar, Footer } from "@components";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="bg-orange-100">
    <Sidebar />
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

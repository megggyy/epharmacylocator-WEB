/* eslint-disable */
import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faChartArea,
  faChartPie,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import admin from "@assets/admin.png";

export default function Sidebar() {
  
  return (
    <nav
      className="fixed top-0 left-0 h-screen w-64 bg-primary-default text-white shadow-lg flex flex-col justify-between"
    >
      {/* Logo and Admin Info */}
      <div className="px-6 py-4">
        <div className="flex flex-col items-center">
          <img
            src={admin}
            alt="Admin Avatar"
            className="w-14 h-14 rounded-full border-2 border-white mb-2"
          />
          <h1 className="text-xl font-bold uppercase">Admin Dashboard</h1>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-green-200">
          Analytics
        </h6>
        <ul className="space-y-1 px-4">
          {[
            {
              icon: faChartLine,
              label: "Summary of Reports",
              link: "/admin/summaryReports",
            },
            {
              icon: faChartSimple,
              label: "New Users Chart",
              link: "/admin/newUsersChart",
            },
            {
              icon: faChartPie,
              label: "Parking Spaces Chart",
              link: "/admin/parkingSpacesPerBarangay",
            },
            {
              icon: faChartArea,
              label: "Monthly Transactions",
              link: "/admin/monthlyTransactions",
            },
            {
              icon: faChartLine,
              label: "Yearly Transactions",
              link: "/admin/yearlyTransactions",
            },
            {
              icon: faChartSimple,
              label: "Maps",
              link: "/admin/maps",
            },
          ].map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-700 text-white font-bold"
                      : "hover:bg-primary-variant text-white-200"
                  }`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="text-lg" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <hr className="my-4 border-green-400" />

        {/* Other Links */}
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-green-200">
          Navigation
        </h6>
        <ul className="space-y-1 px-4">
          {[
            { label: "Barangay", link: "/admin/barangay" },
            { label: "Parking Spaces", link: "/admin/parkingspace" },
            { label: "Parking Slots", link: "/admin/slot" },
            { label: "Users", link: "/admin/users" },
            { label: "Feedback", link: "/admin/feedback" },
            { label: "Transactions", link: "/admin/transactionall" },
          ].map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-700 text-white font-bold"
                      : "hover:bg-primary-variant text-white"
                  }`
                }
              >
                <i className="fas fa-clipboard-list text-lg"></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-green-200 text-sm">
        © {new Date().getFullYear()} Admin Panel
      </div>
    </nav>
  );
}

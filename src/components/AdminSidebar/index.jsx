/* eslint-disable */
import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faChartArea,
  faChartPie,
  faChartLine,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import logo from "@assets/epharmacy-logo.png";

export default function AdminSidebar() {
  
  return (
    <nav
      className="fixed top-0 left-0 h-screen w-64 bg-primary-variant text-white shadow-lg flex flex-col justify-between"
    >
      {/* Logo and Admin Info */}
      <div className="px-6 py-4">
        <div className="flex flex-col items-center">
          <NavLink to="/admin">
            <img
              src={logo}
              alt="Admin Avatar"
              className="w-14 h-14 cursor-pointer mb-2"
            />
          </NavLink>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-primary-t3">
          Analytics
        </h6>
        <ul className="space-y-1 px-4">
          {[
            {
              icon: faClipboardList,
              label: "Reports",
              link: "/admin/reports",
            },
            {
              icon: faChartArea,
              label: "Summary of Reports",
              link: "/admin/summaryReports",
            },
            // {
            //   icon: faChartSimple,
            //   label: "New Users Chart",
            //   link: "/admin/newUsersChart",
            // },
            {
              icon: faChartLine,
              label: "Monthly Pharmacy Registrations",
              link: "/admin/monthlyPharmacyRegistrations",
            },
            // {
            //   icon: faChartArea,
            //   label: "Most Scanned Medicines",
            //   link: "/admin/mostScannedMedicines",
            // },
            {
              icon: faChartSimple,
              label: "Pharmacies Per Barangay",
              link: "/admin/pharmaciesPerBarangay",
            },
            {
              icon: faChartPie,
              label: "Medicines Per Category",
              link: "/admin/medicinesPerCategory",
            },
          ].map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary-t2 text-black font-bold"
                      : "hover:bg-primary-default text-white-200"
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
        <hr className="my-4 border-primary-default" />

        {/* Other Links */}
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-primary-t3">
          Navigation
        </h6>
        <ul className="space-y-1 px-4">
          {[
            { label: "Medicine Categories", link: "/admin/medication-category" },
            { label: "Barangays", link: "/admin/barangays" },
            { label: "Admins", link: "/admin/admins" },
            { label: "Customers", link: "/admin/users" },
            { label: "Pharmacies", link: "/admin/pharmacies" },
            { label: "Licensed Pharmacies", link: "/admin/licensedPharmacies" },

            { label: "Medicines", link: "/admin/medicines" },
          ].map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary-t2 text-black font-bold"
                      : "hover:bg-primary-default text-white"
                  }`
                }
              >
                <i className="fas fa-clipboard-list text-lg"></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
    <hr className="my-4 border-primary-default" />

      </div>
    </nav>
  );
}

import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faEdit,
  faPills,
  faClipboardList,
  faQuestionCircle,
  faFileContract,
} from "@fortawesome/free-solid-svg-icons";
import logo from "@assets/epharmacy-logo.png";

export default function PharmacyOwnerSidebar() {
  return (
    <nav
      className="fixed top-0 left-0 h-screen w-64 bg-primary-variant text-white shadow-lg flex flex-col justify-between"
    >
      {/* Logo and Admin Info */}
      <div className="px-6 py-4">
        <div className="flex flex-col items-center">
          <img src={logo} alt="Admin Avatar" className="w-14 h-14 full mb-2" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-primary-t3">
          Profile
        </h6>
        <ul className="space-y-1 px-4">
          {[
            {
              icon: faUserCircle,
              label: "View Profile",
              link: "/pharmacy-owner/viewProfile",
            },
            {
              icon: faEdit,
              label: "Edit Profile",
              link: "/pharmacy-owner/editProfile",
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

        {/* Navigation Section */}
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-primary-t3">
          Navigation
        </h6>
        <ul className="space-y-1 px-4">
          {[
            {
              icon: faPills,
              label: "Medicines",
              link: "/pharmacy-owner/medicines",
            },
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
                <FontAwesomeIcon icon={item.icon} className="text-lg" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <hr className="my-4 border-primary-default" />

        {/* Others Section */}
        <h6 className="px-6 py-2 text-sm font-bold uppercase text-primary-t3">
          Others
        </h6>
        <ul className="space-y-1 px-4">
          {[
            {
              icon: faFileContract,
              label: "Terms and Conditions",
              link: "/pharmacy-owner/TCs",
            },
            {
              icon: faQuestionCircle,
              label: "FAQs",
              link: "/pharmacy-owner/faqs",
            },
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
                <FontAwesomeIcon icon={item.icon} className="text-lg" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminavatar from "@assets/adminepharmacy.png";
import AuthGlobal from "../../context/AuthGlobal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar() {
  const { state, dispatch } = useContext(AuthGlobal);
  const navigate = useNavigate();

   const handleLogout = () => {
     const toastProps = {
       autoClose: 3000,
     };
     localStorage.removeItem("jwt");
     localStorage.removeItem("auth");
     dispatch({ type: "LOGOUT_USER" });
     toast.success("You have been logged out!", toastProps);
     navigate("/login");
   };
  return (
    <div className="navbar bg-primary-t3 text-primary px-4 py-2 shadow-md flex justify-between items-center">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold text-primary">ePharmacy Locator</span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="w-8 rounded-full overflow-hidden">
            <img
              src={adminavatar}
              alt="Profile "
            />
          </div>

          {/* User Name */}
          <span className="text-sm font-medium text-gray-800">
            {state.user?.name || "Admin"}
          </span>

          {/* Dropdown */}
          <div className="relative">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-circle"
              onClick={(e) => {
                e.stopPropagation();
                const dropdown = document.getElementById("userDropdown");
                dropdown?.classList.toggle("hidden");
              }}
            >
              <i className="fas fa-chevron-down"></i>
            </button>

            <ul
              id="userDropdown"
              className="hidden absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 text-sm"
            >
              <li className="px-4 py-2 hover:bg-gray-100">
                <Link to="/admin/viewProfile" className="text-gray-800">
                  View Profile
                </Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-gray-800"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

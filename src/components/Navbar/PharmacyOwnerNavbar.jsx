import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import adminavatar from "@assets/adminepharmacy.png";
import AuthGlobal from "../../context/AuthGlobal";
import { API_URL } from "../../env";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PharmacyOwnerNavbar() {
  const [userProfile, setUserProfile] = useState({});
  const { state, dispatch } = useContext(AuthGlobal);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      // Fetch user profile data
      axios
        .get(`${API_URL}users/${state.user.userId}`)
        .then((res) => {
          setUserProfile(res.data);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });

    } else {
      navigate('/login'); 
    }
  }, [state.isAuthenticated, state.user.userId]);

  const handleLogout = () => {
    const toastProps = {
      autoClose: 3000,
    };
    localStorage.removeItem("jwt");
    localStorage.removeItem("auth");
    localStorage.removeItem("lastVisitedPath");
    dispatch({ type: "LOGOUT_USER" });
    toast.success("You have been logged out!", toastProps);
    navigate("/login");
  };

  const profileImage = 
  userProfile?.pharmacyDetails?.images?.[0] && typeof userProfile.pharmacyDetails.images[0] === 'string'
    ? userProfile.pharmacyDetails.images[0] // Use the URL directly
    : '@assets/epharmacylogoblue'; // Adjust the path if the image is in the public folder

  return (
    <div className="navbar bg-primary-t3 text-primary px-4 py-2 shadow-md flex justify-between items-center">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2">
        <Link to="/pharmacy-owner" className="flex items-center space-x-2">
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
              src={profileImage}
              alt="Profile "
            />
          </div>

          {/* User Name */}
          <span className="text-sm font-medium text-gray-800">
            {userProfile?.name}
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

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import logo2 from "@assets/epharmacynavbar.png";
import AuthGlobal from "../../context/AuthGlobal";
import axios from "axios";
import { API_URL } from "../../env";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null); // Track the currently open dropdown
  const [userProfile, setUserProfile] = useState(null);
  const { state, dispatch } = useContext(AuthGlobal);
  const navigate = useNavigate();

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };


  useEffect(() => {
    console.log("useEffect is running");
  
    // Check authentication
    console.log("isAuthenticated before check:", state.isAuthenticated);
    if (state.isAuthenticated === false || state.isAuthenticated === null) {
      navigate("/login");
      return; // Stop further execution if not authenticated
    }
  
    // Get token
    const token = localStorage.getItem("jwt");
    console.log("Token from localStorage:", token);
  
    if (token) {
      console.log("Sending API request with token...");
      axios
        .get(`${API_URL}users/${state.user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((user) => {
          setUserProfile(user.data); // Set user data state here
          console.log("User data fetched:", user.data); // Data fetched
          console.log("Profile image URL:", user.data.customerDetails?.images?.[0]);
          console.log("Decoded user from state:", state.user); // Ensure this logs the correct data
          console.log("isAuthenticated:", state.isAuthenticated);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      console.log("No token found in localStorage.");
      navigate("/login"); // Navigate to login if no token exists
    }
  
    // Cleanup
    return () => {
      console.log("Cleaning up useEffect");
      setUserProfile(null); // Reset user profile on cleanup
    };
  }, [state.isAuthenticated, state.user?.userId, navigate]);
  
  
  
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    dispatch({ type: "LOGOUT_USER" });
    setOpenDropdown(null); // Close the dropdown on logout
    navigate("/login");
  };
  
  
  return (
    <nav className="bg-primary-default text-white py-4 px-8">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold">
          <Link to="/">
            <img src={logo2} alt="Logo" className="h-16" />
          </Link>
        </div>

        {/* Navbar links */}
        <div className="flex space-x-8 items-center">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/pharmacies" className="hover:text-gray-300">
            Pharmacies
          </Link>

          {/* Medicines Dropdown */}
          <div className="relative flex items-center">
            <Link to="/medicines" className="hover:text-gray-300">
              Medicines
            </Link>
            <button
              className="ml-2 flex items-center space-x-1 focus:outline-none"
              onClick={() => toggleDropdown("medicines")}
            >
              <IoIosArrowDown className="hover:text-gray-300" />
            </button>
            {openDropdown === "medicines" && (
              <div className="absolute bg-white text-black py-2 mt-1 w-40 rounded-lg shadow-lg top-full left-0" style={{ zIndex: 9999 }} >
                <Link to="/medicines/category1" className="block px-4 py-2 hover:bg-gray-200">Category 1</Link>
                <Link to="/medicines/category2" className="block px-4 py-2 hover:bg-gray-200">Category 2</Link>
                <Link to="/medicines/category3" className="block px-4 py-2 hover:bg-gray-200">Category 3</Link>
              </div>
            )}
          </div>

          <Link to="/maps" className="hover:text-gray-300">
            Maps
          </Link>
        </div>

        {/* User Profile or Get Started Button */}
        <div>
          {state.isAuthenticated ? (
            <div className="relative flex items-center">
              <img
                src={
                  userProfile?.customerDetails?.images?.[0] ||
                  "https://via.placeholder.com/40"
                }
                alt="User Profile"
                className="w-10 h-10 rounded-full border border-gray-200 mr-2"
              />
              <span className="font-medium">{userProfile?.name || "User"}</span>
              <button
                className="ml-2 flex items-center space-x-1 focus:outline-none"
                onClick={() => toggleDropdown("profile")}
              >
                <IoIosArrowDown className="hover:text-gray-300" />
              </button>
              {openDropdown === "profile" && (
                <div className="absolute bg-white text-black py-2 mt-1 w-40 rounded-lg shadow-lg top-full right-0" style={{ zIndex: 9999 }} >
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">View Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary-t2 text-black py-2 px-6 rounded-lg hover:bg-white"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

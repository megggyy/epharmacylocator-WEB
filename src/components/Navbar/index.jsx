import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import logo2 from "@assets/epharmacynavbar.png";
import AuthGlobal from "../../context/AuthGlobal";
import axios from "axios";
import { API_URL } from "../../env";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUpload
} from "react-icons/fa";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null); // Track the currently open dropdown
  const [userProfile, setUserProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const { state, dispatch } = useContext(AuthGlobal);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedications(query, selectedCategory);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowCategoryDropdown(false);
    filterMedications(searchQuery, categoryName);
  };

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("jwt");
    if (token) {
      axios
        .get(`${API_URL}users/${state.user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((user) => {
          setUserProfile(user.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      navigate("/login");
    }

    // Fetch categories
    axios.get(`${API_URL}medication-category`)
      .then(response => setCategories(response.data))
      .catch(error => console.error("Error fetching categories:", error));

    return () => {
      setUserProfile(null);
    };
  }, [state.isAuthenticated, state.user?.userId, navigate]);

  const handleLogout = () => {
    const toastProps = {
      autoClose: 3000,
    };
    localStorage.removeItem("jwt");
    localStorage.removeItem("auth");
    localStorage.removeItem("lastVisitedPath");
    dispatch({ type: "LOGOUT_USER" });
    setOpenDropdown(null);
    toast.success("You have been logged out!", toastProps);
    navigate("/login");
  };

  const authLinks = (
    <div className="flex space-x-8 items-center">
      <Link to="/customer" className="hover:text-gray-300">
        Home
      </Link>
      <Link to="/customer/pharmacies" className="hover:text-gray-300">
        Pharmacies
      </Link>
      <div className="relative flex items-center">
        <Link to="/customer/medicines" className="hover:text-gray-300">
          Medicines
        </Link>
        <button
          className="ml-2 flex items-center space-x-1 focus:outline-none"
          onClick={() => toggleDropdown("medicines")}
        >
          <IoIosArrowDown className="hover:text-gray-300" />
        </button>
        {openDropdown === "medicines" && (
  <div
    className="absolute bg-white text-black py-2 mt-1 w-[600px] rounded-lg shadow-lg top-full left-0 z-10 max-h-96 overflow-y-auto"
  >
    <input
      type="text"
      className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
      placeholder="Search categories..."
      value={categorySearchQuery}
      onChange={(e) => setCategorySearchQuery(e.target.value)}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {categories
        .filter((cat) =>
          cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
        )
        .map((category, index) => (
          <Link
            key={category._id}
            to={`/medicines/category/${category._id}`}
            className="block break-words px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded text-center"
          >
            {category.name}
          </Link>
        ))}
    </div>
  </div>
)}


      </div>
      <Link to="/customer/maps" className="hover:text-gray-300">
        Maps
      </Link>
    </div>
  );

  const guestLinks = (
    <div className="flex space-x-8 items-center">
      <Link to="/" className="hover:text-gray-300">
        Home
      </Link>
      <Link to="/pharmacies" className="hover:text-gray-300">
        Pharmacies
      </Link>
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
          <div
            className="absolute bg-white text-black py-2 mt-1 w-40 rounded-lg shadow-lg top-full left-0"
            style={{ zIndex: 9999 }}
          >
            {categories.map((category) => (
              <Link 
                key={category._id} 
                to={`/medicines/category/${category._id}`} 
                className="block px-4 py-2 hover:bg-gray-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link to="/maps" className="hover:text-gray-300">
        Maps
      </Link>
    </div>
  );

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
        {state.isAuthenticated ? authLinks : guestLinks}

        {/* User Profile or Get Started Button */}
        <div>
          {state.isAuthenticated ? (
            <div className="relative flex items-center">
              <Link to="/customer/prescription-upload" className="hover:text-gray-300">
                <FaUpload className="text-primary-variant text-3xl mr-4" />
              </Link>

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
                <div
                  className="absolute bg-white text-black py-2 mt-1 w-40 rounded-lg shadow-lg top-full right-0"
                  style={{ zIndex: 9999 }}
                >
                  <Link to="/customer/viewProfile" className="block px-4 py-2 hover:bg-gray-200">
                    View Profile
                  </Link>
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

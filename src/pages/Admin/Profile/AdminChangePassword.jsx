import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import AuthGlobal from "@/context/AuthGlobal";
import PulseSpinner from "../../../assets/common/spinner";
import { API_URL } from "../../../env";



const AdminChangePasswordScreen = () => {
  const [userId, setUserId] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const { dispatch } = useContext(AuthGlobal);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("User not logged in");

        const decoded = jwtDecode(token);
        const userId = decoded?.userId;

        if (!userId) throw new Error("User ID not found in token");

        const response = await axios.get(`${API_URL}users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setUserId(response.data);
      } catch (error) {
        alert(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const validate = () => {
    let errorMessages = {};
    if (!newPassword) {
      errorMessages.newPassword = "PASSWORD IS REQUIRED";
    } else if (newPassword.length < 8) {
      errorMessages.newPassword = "PASSWORD MUST BE AT LEAST 8 CHARACTERS";
    }
    if (!confirmPassword) {
      errorMessages.confirmPassword = "PASSWORD IS REQUIRED";
    } else if (confirmPassword.length < 8) {
      errorMessages.confirmPassword = "PASSWORD MUST BE AT LEAST 8 CHARACTERS";
    }
    if (!oldPassword) {
      errorMessages.oldPassword = "PASSWORD IS REQUIRED";
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errorMessages.confirmPassword = "PASSWORD DO NOT MATCH";
    }

    return errorMessages;
  };

  const handleUpdatePassword = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    console.log(userId)
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}users/change-password`, {
        userId,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        alert("Password successfully updated. Please login.");
        localStorage.removeItem("jwt");
        localStorage.removeItem("auth");
        localStorage.removeItem("lastVisitedPath");
        dispatch({ type: "LOGOUT_USER" });
        navigate("/login");
      }
      else {
        console.log(data.message)
        if (data.message === 'NOT_MATCH') {
          toast.error("OLD PASSWORD IS INCORRECT!");
        } else {
          // Handle other server errors
          toast.error("UPDATING PASSWORD FAILED!")
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
     
      {loading ? (
        <PulseSpinner />
      ) : (
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <button
              className="text-primary-default text-lg"
              onClick={() => navigate(-1)}
            >
              &larr; Back
            </button>
            <ToastContainer />
            <h1 className="text-2xl font-bold text-center flex-grow">
              Change Password
            </h1>
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Old Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-100 border rounded-md p-2"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {error.oldPassword && <p className="text-red-500 text-sm">{error.oldPassword}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 mb-1">New Password *</label>
            <div className="relative">
              <input
                type={showPassword1 ? "text" : "password"}
                className="w-full bg-gray-100 border rounded-md p-2"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-2"
                onClick={() => setShowPassword1(!showPassword1)}
              >
                {showPassword1 ? "Hide" : "Show"}
              </button>
            </div>
            {error.newPassword && <p className="text-red-500 text-sm">{error.newPassword}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Re-type Password *</label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                className="w-full bg-gray-100 border rounded-md p-2"
                placeholder="Re-type Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-2"
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? "Hide" : "Show"}
              </button>
            </div>
            {error.confirmPassword && <p className="text-red-500 text-sm">{error.confirmPassword}</p>}
          </div>

          <button
            className="w-full bg-primary-default text-white py-2 rounded-md"
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminChangePasswordScreen;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthGlobal from "@/context/AuthGlobal";
import PulseSpinner from "../../../assets/common/spinner";

const PharmacyChangePasswordScreen = () => {
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
    const fetchUserId = async () => {
      const storedUserId = localStorage.getItem("userId");
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  const validate = () => {
    let errorMessages = {};
    if (!newPassword) errorMessages.newPassword = "New password is required";
    if (!confirmPassword) errorMessages.confirmPassword = "Confirm password is required";
    if (!oldPassword) errorMessages.oldPassword = "Old password is required";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errorMessages.confirmPassword = "Passwords do not match";
    }
    return errorMessages;
  };

  const handleUpdatePassword = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${baseURL}users/change-password`, {
        userId,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        alert("Password successfully updated. Please login.");
        localStorage.removeItem("jwt");
        dispatch({ type: "LOGOUT_USER" });
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred. Please try again.");
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

export default PharmacyChangePasswordScreen;

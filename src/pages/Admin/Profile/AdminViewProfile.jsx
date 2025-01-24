import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../../env";
import admin from "@assets/adminepharmacy.png";

const AdminViewProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

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

        setUserData(response.data);
      } catch (error) {
        alert(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const address = `${userData.street || ""}, ${userData.barangay || ""}, ${userData.city || ""}`
    .replace(/(, )+/g, ", ")
    .trim();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-primary-t3">
        <div className="animate-spin h-10 w-10 border-4 border-t-primary-default border-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <button
          className="text-white font-medium text-lg"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <div>
          <h1 className="text-2xl font-bold">View Profile</h1>
        </div>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mt-8">
        <img
          src={admin}
          alt="Profile"
          className="w-24 h-24 rounded-full shadow-md"
        />
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-md mx-4 mt-6 p-6">
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Name</label>
          <input
            type="text"
            className="w-full bg-gray-100 border rounded-md p-2"
            value={userData.name || ""}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Email</label>
          <input
            type="text"
            className="w-full bg-gray-100 border rounded-md p-2"
            value={userData.email || ""}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Mobile Number</label>
          <input
            type="text"
            className="w-full bg-gray-100 border rounded-md p-2"
            value={userData.contactNumber || ""}
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Address</label>
          <input
            type="text"
            className="w-full bg-gray-100 border rounded-md p-2"
            value={address || "N/A"}
            disabled
          />
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-primary-default text-white px-6 py-2 rounded-md shadow-md hover:bg-primary-dark"
          onClick={() => navigate("/admin/editProfile")}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default AdminViewProfile;

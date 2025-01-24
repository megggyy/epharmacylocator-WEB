import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../../env"; // Ensure the URL is correct
import adminImage from "@assets/adminepharmacy.png";
import Select from "react-select";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminEditProfile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState({ label: "", value: "" });
  const [city, setCity] = useState("");
  const [barangays, setBarangays] = useState([]);
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
            Authorization: `Bearer ${token}`,
          },
        });
  
        const { name, email, contactNumber, street, barangay, city } = response.data;
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setStreet(street || "");
        setBarangay({ label: barangay, value: barangay });
        setCity(city || "");
      } catch (error) {
        alert(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchBarangays = async () => {
      try {
        const response = await axios.get(`${API_URL}barangays`);
        const formattedBarangays = response.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setBarangays(formattedBarangays);
      } catch (error) {
        console.error("Error fetching barangays:", error);
        alert("Failed to load barangays. Please try again later.");
      }
    };
  
    fetchUserData();
    fetchBarangays();
  }, []);

  const handleBarangayChange = (selected) => {
    setBarangay(selected || { label: "", value: "" });
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("User not logged in");
  
      const userId = jwtDecode(token)?.userId;
  
      await axios.put(
        `${API_URL}users/${userId}`,
        {
          name,
          email,
          contactNumber: mobile,
          street,
          barangay: barangay.value,  // Send only the `value` (string) of barangay
          city,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      toast.success("Profile updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
  
      navigate("/admin/viewProfile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("There was an issue updating your profile.");
    }
  };

  const handleChangePassword = () => {
    navigate("/admin/changePassword"); // Adjust to the correct path for your password change page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-t-[#0B607E] border-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <button className="text-white font-medium text-lg" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mt-8">
        <img src={adminImage} alt="Profile" className="w-24 h-24 rounded-full shadow-md" />
      </div>

      {/* Form */}
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-gray-600 mb-1">Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={email}
            readOnly
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Mobile</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Street</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Barangay</label>
          <Select
            value={barangay}
            onChange={handleBarangayChange}
            options={barangays}
            placeholder="Select Barangay"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">City</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-[#0B607E] text-white py-2 rounded-lg mt-6"
        >
          Save Changes
        </button>

        {/* Change Password Button */}
        <button
          onClick={handleChangePassword}
          className="w-full bg-gray-300 text-[#0B607E] py-2 rounded-lg mt-4"
        >
          Change Password
        </button>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AdminEditProfile;

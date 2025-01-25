import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import Select from "react-select";
import PulseSpinner from "../../../assets/common/spinner";
import { API_URL } from "../../../env";
import { ToastContainer, toast } from "react-toastify";

export default function OwnerEditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState({ label: "", value: "" });
  const [city, setCity] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [businessDays, setBusinessDays] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [closingHours, setClosingHours] = useState("");

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

        const { name, email, contactNumber, street, barangay, city, pharmacyDetails } =
          response.data;
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setStreet(street || "");
        setBarangay({ label: barangay, value: barangay });
        setCity(city || "");
        setImages(pharmacyDetails?.images || []);
        setBusinessDays(pharmacyDetails?.businessDays || "");
        setOpeningHours(pharmacyDetails?.openingHour || "");
        setClosingHours(pharmacyDetails?.closingHour || "");
      } catch (error) {
        alert(error.message);
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

  const selectImages = (event) => {
    const files = event.target.files;
    setImages((prevImages) => [...prevImages, ...files]);
  };
  

  const handleDeleteImage = (imageUrl) => {
    setImages(images.filter((img) => img !== imageUrl));
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("User not logged in");

      const decoded = jwtDecode(token);
      const userId = decoded?.userId;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("contactNumber", mobile);
      formData.append("street", street);
      formData.append("barangay", barangay.value);
      formData.append("city", city);

      Array.from(images).forEach((file) => {
        formData.append("images", file);
      });
      

      await axios.put(`${API_URL}users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = await axios.get(`${API_URL}users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setImages(updatedUser.data.pharmacyDetails?.images || []);

      toast.success("Profile updated successfully.");
      navigate("/pharmacy-owner/viewProfile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  
  const handleBarangayChange = (selected) => {
    setBarangay(selected || { label: "", value: "" });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {loading ? (
        <PulseSpinner />
      ) : (
        <div className="max-w-3xl mx-auto py-8">
          <div className="bg-primary-default text-white text-center py-4 rounded-md">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-4 bg-white text-blue-600 rounded-full p-2"
            >
              Back
            </button>
            <h1 className="text-lg font-semibold">Edit Profile</h1>
          </div>
          <div className="bg-white p-6 rounded-md mt-6 shadow-md">
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Mobile</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Street</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Barangay</label>
              {/* <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select your barangay</option>
                {barangays.map((b, index) => (
                  <option key={index} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select> */}
             <Select
                value={barangay}
                onChange={handleBarangayChange}
                options={barangays}
                placeholder="Select Barangay"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">City</label>
              <input
                type="text"
                value={city}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Business Days</label>
              <input
                type="text"
                value={businessDays}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Store Hours</label>
              <input
                type="text"
                value={`${openingHours} - ${closingHours}`}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Profile Images</label>
              <div className="flex flex-wrap gap-4">
              {Array.from(images).map((file, index) => {
                const imageUrl = file instanceof File ? URL.createObjectURL(file) : file;
                return (
                    <div key={index} className="relative">
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="w-20 h-20 object-cover rounded-md"
                    />
                    <button
                        onClick={() => handleDeleteImage(imageUrl)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                        ✕
                    </button>
                    </div>
                );
                })}
              </div>
              <input
                type="file"
                onChange={selectImages}
                className="mt-2 w-full"
              />
            </div>
            <div className="mb-6">
              <button
                onClick={() => navigate("/pharmacy-owner/change-password")}
                className="block w-full bg-gray-200 text-center p-2 rounded-md"
              >
                Change Password
              </button>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full bg-primary-variant text-white p-3 rounded-md"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

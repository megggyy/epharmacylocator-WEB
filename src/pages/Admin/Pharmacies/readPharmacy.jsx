import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";

const ReadPharmacyScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchPharmacy = async () => {
        try {
          const response = await axios.get(`${API_URL}pharmacies/${id}`); // Adjust URL accordingly
          setPharmacy(response.data);
        } catch (err) {
          console.error("Error fetching pharmacy details:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPharmacy();
    }
  }, [id]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}pharmacies/approved/${id}`);
      toast.success("Pharmacy approved successfully!");
      navigate("/admin/pharmacies");
    } catch (error) {
      console.error("Error approving pharmacy:", error);
      toast.error("Failed to approve pharmacy. Please try again.");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-700 mb-4">Pharmacy not found!</p>
        <button
          className="bg-[#0B607E] text-white py-2 px-4 rounded-md"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      {/* Header */}
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <button
          className="text-white font-medium text-lg"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">{pharmacy.userInfo.name}</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Pharmacy Images */}
        <h2 className="text-xl font-bold mb-4">Pharmacy Images</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {pharmacy.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Pharmacy"
              className="w-48 h-48 object-cover rounded-lg cursor-pointer"
              onClick={() => handleImageClick(image)}
            />
          ))}
        </div>

        {/* Pharmacy Permits */}
        <h2 className="text-xl font-bold mt-8 mb-4">Pharmacy Permits</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {pharmacy.permits.map((permit, index) => (
            <img
              key={index}
              src={permit}
              alt="Permit"
              className="w-48 h-48 object-cover rounded-lg cursor-pointer"
              onClick={() => handleImageClick(permit)}
            />
          ))}
        </div>

        {/* Details Section */}
        <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Pharmacy Details</h2>

          <div className="mb-4">
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={pharmacy.userInfo.email}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={pharmacy.userInfo.contactNumber || "N/A"}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700">Address</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700">Business Days</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={pharmacy.businessDays || "N/A"}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700">Operating Hours</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full"
              value={`${pharmacy.openingHour || "N/A"} - ${pharmacy.closingHour || "N/A"}`}
              disabled
            />
          </div>

          <button
            className={`py-2 px-4 rounded-md w-full font-medium ${
              pharmacy.approved
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0B607E] text-white"
            }`}
            onClick={() => handleApprove(pharmacy._id)}
            disabled={pharmacy.approved}
          >
            {pharmacy.approved ? "Approved" : "Approve Pharmacy"}
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <img
            src={selectedImage}
            alt="Selected"
            className="w-auto h-auto max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ReadPharmacyScreen;

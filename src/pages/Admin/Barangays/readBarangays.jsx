import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";

const ReadBarangayScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [barangayData, setBarangayData] = useState(null);

  useEffect(() => {
    const fetchBarangay = async () => {
      try {
        const response = await axios.get(`${API_URL}barangays/${id}`);
        setBarangayData(response.data);
      } catch (error) {
        console.error("Error fetching barangay:", error);
        toast.error("Failed to load barangay details", { autoClose: 3000 });
      }
    };
    if (id) fetchBarangay();
  }, [id]);

  if (!barangayData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <span>Loading...</span>
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
        <div>
          <h1 className="text-2xl font-bold">Barangay Details</h1>
        </div>
      </div>

      {/* Barangay Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mx-4 my-6">
        <div className="flex justify-center mb-6">
          <img
            src={barangayData.image || "default-image.jpg"}
            alt="Barangay"
            className="w-36 h-36 object-cover rounded-lg"
          />
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg mb-2">Name:</div>
          <div className="text-gray-700 text-lg">{barangayData.name}</div>
        </div>
      </div>
    </div>
  );
};

export default ReadBarangayScreen;

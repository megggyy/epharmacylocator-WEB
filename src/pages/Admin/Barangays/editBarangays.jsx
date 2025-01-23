import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";

const EditBarangay = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchBarangay = async () => {
      try {
        const response = await axios.get(`${API_URL}barangays/${id}`);
        const barangay = response.data;
        setName(barangay.name);
      } catch (error) {
        console.error("Error fetching barangay:", error);
        toast.error("Failed to load barangay details", { autoClose: 3000 });
      }
    };
    if (id) fetchBarangay();
  }, [id]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleConfirm = async () => {
    const formData = new FormData();
    formData.append("name", name);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${API_URL}barangays/update/${id}`, formData, config);
      toast.success("Barangay updated successfully", { autoClose: 3000 });
      navigate("/admin/barangays");
    } catch (error) {
      console.error("Error updating barangay:", error);
      toast.error("Failed to update barangay", { autoClose: 3000 });
    }
  };

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
          <h1 className="text-2xl font-bold">Edit Barangay</h1>
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-white rounded-lg shadow-md p-6 mx-4 my-6">
        <label className="block text-gray-600 mb-2">Barangay Name</label>
        <input
          type="text"
          className="border border-gray-300 rounded-md p-2 w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter barangay name"
        />

        <button
          className="bg-[#0B607E] text-white py-2 px-4 rounded-md font-medium w-full"
          onClick={handleConfirm}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default EditBarangay;

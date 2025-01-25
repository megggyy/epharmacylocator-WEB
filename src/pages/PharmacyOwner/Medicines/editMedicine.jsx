import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../env";
import { toast } from "react-toastify";

export default function EditMedicationScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Store category ID
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pharmacy, setPharmacy] = useState("");
  const [pharmacyId, setPharmacyId] = useState(""); // Store pharmacy ID

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine/read/${id}`);
        const medication = response.data;
        setName(medication.name);
        setCategory(medication.category.name); // Display category name
        setCategoryId(medication.category._id); // Store category ID
        setStock(medication.stock.toString());
        setImages(medication.images || []);
        setPharmacy(medication.pharmacy.userInfo.name); // Display pharmacy name
        setPharmacyId(medication.pharmacy._id); // Store pharmacy ID
      } catch (error) {
        console.error("Error fetching medication:", error);
        alert("Failed to load medication details");
      }
    };

    if (id) fetchMedication();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}medication-category`);
        setCategories(
          response.data.map((category) => ({
            label: category.name,
            value: category._id, // Use category ID for the value
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleConfirm = async () => {
    const data = { stock };

    try {
      await axios.put(`${API_URL}medicine/update/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Medication updated successfully");
      navigate("/pharmacy-owner/medicines");
    } catch (error) {
      console.error("Error updating medication:", error);
      toast.error("Failed to update medication");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-100 text-white p-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-default text-lg font-bold"
        >
          &larr; Back
        </button>
        <h1 className="text-lg font-bold text-primary-default">Edit Medication</h1>
      </div>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            className="w-full bg-gray-200 p-3 rounded-lg"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <input
            type="text"
            value={category || "Loading..."}
            className="w-full bg-gray-200 p-3 rounded-lg"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />
        </div>
        <button
          onClick={handleConfirm}
          className="bg-primary-default text-white py-2 px-4 rounded-lg w-full hover:bg-blue-600"
        >
          Update
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../env";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";

export default function EditMedicationScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [medicationData, setMedicationData] = useState(null);
  const [stocks, setStocks] = useState({});
  const [expirationDates, setExpirationDates] = useState({});
  const [category, setCategory] = useState("");
  const [isCategory, setIsCategory] = useState(true);
  const [price, setPrice] = useState('');

  useEffect(() => {
 const fetchMedication = async () => {
  try {
    const response = await axios.get(`${API_URL}medicine/read/${id}`);
    setMedicationData(response.data);

    const initialStocks = {};
    const initialExpirations = {};
    response.data.expirationPerStock.forEach((exp, index) => {
      initialStocks[index] = exp.stock.toString();
      const parsedDate = new Date(exp.expirationDate);
      initialExpirations[index] = !isNaN(parsedDate) ? parsedDate : null;
    });

    setStocks(initialStocks);
    setExpirationDates(initialExpirations);
    setPrice(
      response.data.price !== undefined && response.data.price !== null
        ? response.data.price.toString()
        : ''
    );
  } catch (error) {
    console.error("Error fetching medication:", error.response?.data || error.message);
  }
};


    if (id) fetchMedication();
  }, [id]);

  useEffect(() => {
    if (medicationData?.medicine?.category) {
      const newCategory = Array.isArray(medicationData.medicine.category)
        ? medicationData.medicine.category.map((cat) => cat.name).join("/ ")
        : medicationData.medicine.category?.name || "No Category";

      setCategory(newCategory);
    }
  }, [medicationData]);

  const handleCategoryClick = () => {
    setIsCategory((prev) => !prev);
  };

  const handleConfirm = async () => {
    const updatedData = Object.keys(stocks).map((index) => {
      const rawDate = expirationDates[index];
      const isoDate = rawDate ? new Date(rawDate).toISOString().split("T")[0] : null;
      const stockValue = parseInt(stocks[index], 10) || 0;
      return { expirationDate: isoDate, stock: stockValue };
    });

    try {
      await axios.put(`${API_URL}medicine/update/${id}`, {
        expirationPerStock: updatedData,
        price: price.trim() === '' ? null : parseFloat(price),
      });
      toast.success("The medication has been updated successfully.");
      navigate("/pharmacy-owner/medicines");
    } catch (error) {
      console.error("Error updating medication:", error);
      toast.error("Failed to update medication. Please try again.");
    }
  };

  const handleExpirationChange = (index, date) => {
    setExpirationDates((prev) => ({
      ...prev,
      [index]: date,
    }));
  };

  const addNewItem = () => {
    const newIndex = Object.keys(stocks).length;
    setStocks((prev) => ({ ...prev, [newIndex]: "" }));
    setExpirationDates((prev) => ({ ...prev, [newIndex]: null }));
  };

  const removeItem = (index) => {
    const updatedStocks = { ...stocks };
    const updatedExpirations = { ...expirationDates };

    delete updatedStocks[index];
    delete updatedExpirations[index];

    setStocks(updatedStocks);
    setExpirationDates(updatedExpirations);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-gray-100 text-white p-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/pharmacy-owner/medicines")}
          className="text-primary-default text-lg font-bold"
        >
          &larr; Back
        </button>
        <h1 className="text-lg font-bold text-primary-default">Edit Medication</h1>
      </div>

      {/* Medication Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-6">

        {/* Generic Name */}
        <div className="mb-4">
          <label className="block text-black-700 font-bold mb-2">Generic Name</label>
          <input
            type="text"
            value={medicationData?.medicine?.genericName || ""}
            className="w-full bg-gray-300 p-3 rounded-lg"
            disabled
          />
        </div>

        {/* Dosage Strength */}
        <div className="mb-4">
          <label className="block text-black-700 font-bold mb-2">Dosage Strength</label>
          <input
            type="text"
            value={medicationData?.medicine?.dosageStrength || ""}
            className="w-full bg-gray-300 p-3 rounded-lg"
            disabled
          />
        </div>

        {/* Dosage Form */}
        <div className="mb-4">
          <label className="block text-black-700 font-bold mb-2">Dosage Form</label>
          <input
            type="text"
            value={medicationData?.medicine?.dosageForm || ""}
            className="w-full bg-gray-300 p-3 rounded-lg"
            disabled
          />
        </div>

        {/* Classification */}
        <div className="mb-4">
          <label className="block text-black-700 font-bold mb-2">Classification</label>
          <input
            type="text"
            value={medicationData?.medicine?.classification || ""}
            className="w-full bg-gray-300 p-3 rounded-lg"
            disabled
          />
        </div>

        {/* Category (clickable) */}
        <div className="mb-4">
          <label className="block text-black-700 font-bold mb-2">Category</label>
          <input
            type="text"
            value={
              isCategory
                ? category || "No Category"
                : medicationData?.medicine?.description || "No Description"
            }
            onClick={handleCategoryClick}
            className="w-full bg-black-300 p-3 rounded-lg cursor-pointer hover:bg-gray-400"
            readOnly
          />
        </div>

    {/* Price Input */}
    <div className="mb-4">
      <label className="block text-black-700 font-bold mb-2">Price (₱)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Enter price"
        className="w-full p-3 border rounded-lg"
      />
    </div>

        {/* Expiration Date + Stock (Dynamic Items) */}
        <div className="mb-4">
          <label className="block text-black-700 font-bold mb-2">Expiration & Stock</label>
          {Object.keys(stocks).length > 0 ? (
            Object.keys(stocks).map((index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                {/* Expiration Date */}
                <DatePicker
                  selected={expirationDates[index]}
                  onChange={(date) => handleExpirationChange(index, date)}
                  dateFormat="MMMM dd, yyyy"
                  placeholderText="Select Date"
                  className="p-2 border rounded w-40"
                />

                {/* Stock Input */}
                <input
                  type="number"
                  value={stocks[index]}
                  onChange={(e) =>
                    setStocks((prev) => ({ ...prev, [index]: e.target.value }))
                  }
                  className="w-20 p-2 border rounded"
                />

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <p className="bg-gray-100 p-2 rounded">No Expiration Data</p>
          )}

          {/* Add New Item Button */}
          <button
            onClick={addNewItem}
            className="mt-2 text-black-600 hover:text-black-800"
          >
            + Add Expiration
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleConfirm}
          className="bg-primary-default text-white py-2 px-4 rounded-lg w-full hover:bg-black-600"
        >
          Update
        </button>
      </div>
    </div>
  );
}

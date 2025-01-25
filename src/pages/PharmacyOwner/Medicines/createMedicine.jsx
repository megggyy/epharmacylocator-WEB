import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthGlobal from "@/context/AuthGlobal";
import antibioticsData from "@/assets/medicines/antibiotics.json";
import sedativesData from "@/assets/medicines/sedatives.json";
import { toast, ToastContainer } from "react-toastify";
import { API_URL } from "../../../env";

const CreateMedicines = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState([]);
  const [stockInput, setStockInput] = useState({});
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories] = useState(["Antibiotics", "Sedatives"]);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchMedicine, setSearchMedicine] = useState("");
  const { state } = useContext(AuthGlobal);

  useEffect(() => {
    setFilteredMedicines(medicines);
    setFilteredCategory(categories);
  }, [medicines, categories]);

  const filterMedicines = (text) => {
    setSearchMedicine(text);
    if (text === "") {
      setFilteredMedicines(medicines);
    } else {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  };

  const filterCategory = (text) => {
    setSearchCategory(text);
    if (text === "") {
      setFilteredCategory(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategory(filtered);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);

    let filteredMedicines = [];
    if (category === "Antibiotics") {
      filteredMedicines = antibioticsData;
    } else if (category === "Sedatives") {
      filteredMedicines = sedativesData;
    }

    fetchExistingMedicines(filteredMedicines);
  };

  const fetchExistingMedicines = async (categoryMedicines) => {
    try {
      const response = await axios.get(`${API_URL}medicine/${state.user.userId}`);
      const existingMedicines = response.data;

      const newMedicines = categoryMedicines.filter(
        (medicine) =>
          !existingMedicines.some(
            (existingMedicine) => existingMedicine.name === medicine.name
          )
      );

      setMedicines(newMedicines);
    } catch (error) {
      console.error("Error fetching existing medicines: ", error);
    }
  };

  const handleStockChange = (index, value) => {
    setStockInput((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = async (index) => {
    const selectedMedicine = medicines[index];
    const stockValue = stockInput[index] || 0;

    try {
      await axios.post(`${API_URL}medicine/create`, {
        name: selectedMedicine.name,
        //description: selectedMedicine.description,
        stock: stockValue,
        pharmacy: state.user.userId,
        category: selectedCategory,
      });

      setMedicines((prev) => prev.filter((_, i) => i !== index));
      setStockInput((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      toast.success("Medication added successfully!");
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to add medication.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
        <ToastContainer/>
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <button
          className="text-white font-medium text-lg"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <div>
          <h1 className="text-2xl font-bold">Create Medicine</h1>
        </div>
      </div>
      <main className="p-4">
        <button
          className="bg-teal-600 text-white py-2 px-4 rounded mb-4"
          onClick={() => setCategoryModalVisible(true)}
        >
          {selectedCategory || "Select Category"}
        </button>

        {categoryModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg">
              <input
                type="text"
                placeholder="Search Category"
                value={searchCategory}
                onChange={(e) => filterCategory(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <ul>
                {filteredCategory.map((category, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:bg-gray-200 p-2"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setCategoryModalVisible(false)}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Search Medicines"
          value={searchMedicine}
          onChange={(e) => filterMedicines(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        {filteredMedicines.length === 0 && (
          <p className="text-center text-gray-500">
            No medicines available for the selected category.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filteredMedicines.map((medicine, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <p>
                <strong>Name:</strong> {medicine.name}
              </p>
              {/* <p>
                <strong>Description:</strong> {medicine.description}
              </p> */}
              <p>
                <strong>Stock:</strong> {medicine.stock || 0}
              </p>
              <input
                type="number"
                placeholder="Enter stock to add"
                value={stockInput[index] || ""}
                onChange={(e) => handleStockChange(index, e.target.value)}
                className="border px-3 py-2 rounded w-full mt-2"
              />
              <button
                onClick={() => handleSubmit(index)}
                className="bg-teal-600 text-white py-2 px-4 rounded mt-4"
              >
                ADD
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CreateMedicines;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../env";
import { Link } from "react-router-dom";

const MedicinePage = () => {
  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    axios
      .get(`${API_URL}medication-category`)
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));

    axios
      .get(`${API_URL}medicine`)
      .then((response) => {
        const updatedMedications = response.data.map((medicine) => ({
          ...medicine,
          categoryNames: medicine.category.map((cat) => cat.name).join(" / "),
        }));

        setMedications(updatedMedications);
        setFilteredMedications(updatedMedications);
      })
      .catch((error) => console.error("Error fetching medications:", error));
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedications(query, selectedCategory);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowCategoryDropdown(false);
    filterMedications(searchQuery, categoryName);
  };

  const filterMedications = (query, categoryName) => {
    let filtered = medications;

    if (query) {
      filtered = filtered.filter(
        (med) =>
          med.brandName.toLowerCase().includes(query.toLowerCase()) ||
          med.genericName.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (categoryName) {
      filtered = filtered.filter((med) =>
        med.category.some((cat) => cat.name === categoryName)
      );
    }

    setFilteredMedications(filtered);
    setCurrentPage(1); // Reset pagination to the first page
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedications = filteredMedications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-6">
        {/* Search and Category Selection */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          {/* Search Bar */}
          <input
            type="text"
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Search for medicines..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyUp={(e) => handleSearch(e.target.value)}
          />

          {/* Category Dropdown */}
          <div className="relative w-full">
        <button
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 text-left flex justify-between items-center"
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          {selectedCategory || "Select Category"}
          <span className="text-gray-500">▼</span>
        </button>

  {showCategoryDropdown && (
    <div className="absolute left-0 right-0 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto p-2">
      <input
        type="text"
        className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
        placeholder="Search categories..."
        value={categorySearchQuery}
        onChange={(e) => setCategorySearchQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
        {categories
          .filter((cat) =>
            cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
          )
          .map((cat) => (
            <button
              key={cat._id}
              className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded"
              onClick={() => handleCategorySelect(cat.name)}
            >
              {cat.name}
            </button>
          ))}
      </div>
    </div>
  )}
</div>

        </div>

        {/* Medications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedMedications.map((med) => (
            <div
              key={med._id}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {med.brandName}
              </h3>
              <p className="text-sm text-gray-600 italic">{med.genericName}</p>
              <p className="text-sm text-gray-700">
                💊 Dosage: {med.dosageStrength || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                📌 Form: {med.dosageForm || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                📂 Classification: {med.classification || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                📋 Category: {med.categoryNames || "No Category"}
              </p>

              <Link to={`/MedicationDetails/${encodeURIComponent(med.genericName)}`}>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  View Availability
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              className={`px-4 py-2 mx-1 text-sm font-medium text-white bg-blue-500 rounded-md ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-4 py-2 mx-1 text-sm font-medium rounded-md ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-500 hover:bg-blue-100"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className={`px-4 py-2 mx-1 text-sm font-medium text-white bg-blue-500 rounded-md ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicinePage;

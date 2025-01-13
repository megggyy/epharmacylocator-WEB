import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../env";

const MedicinePage = () => {
  const [categories, setCategories] = useState([]);
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    // Fetch categories
    axios
      .get(`${API_URL}medication-category`)
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));

    // Fetch medications
    axios
      .get(`${API_URL}medicine`)
      .then((response) => {
        const uniqueMedications = Array.from(
          new Map(response.data.map((med) => [med.name, med])).values()
        );
        setMedications(uniqueMedications);
        setFilteredMedications(uniqueMedications);
      })
      .catch((error) => console.error("Error fetching medications:", error));
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedications(query, selectedCategories);
  };

  const handleCategoryToggle = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);
    filterMedications(searchQuery, updatedCategories);
  };

  const filterMedications = (query, categories) => {
    let filtered = medications;

    if (query) {
      filtered = filtered.filter((med) =>
        med.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (categories.length > 0) {
      filtered = filtered.filter((med) =>
        categories.includes(med.category?.name)
      );
    }

    setFilteredMedications(filtered);
  };

  return (
    <div className="min-h-screen bg-blue-50">

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Search for medicines..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyUp={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category._id}
                className={`px-4 py-2 rounded-md border shadow-sm text-sm font-medium ${
                  selectedCategories.includes(category.name)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => handleCategoryToggle(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedications.map((med) => (
            <div
              key={med._id}
              className="bg-white p-4 shadow-md rounded-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">{med.name}</h3>
              <p className="text-sm text-gray-600">{med.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MedicinePage;

import React, { useState } from "react";

const MedicineCategoryPage = () => {
  const categories = [
    {
      id: 1,
      name: "Cold and Flu",
      description: "Medicines for cold and flu symptoms.",
      pharmacies: ["City Pharmacy", "HealthMart", "Wellness Center"],
    },
    {
      id: 2,
      name: "Pain Relief",
      description: "Pain relievers for headaches, muscle pain, and more.",
      pharmacies: ["PharmaCare", "QuickMeds", "MediLife Pharmacy"],
    },
    {
      id: 3,
      name: "Allergies",
      description: "Relief for allergies and hay fever.",
      pharmacies: ["Friendly Pharmacy", "PillPoint", "CureWell Drugs"],
    },
  ];

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories =
    selectedCategories.length > 0
      ? categories.filter(
          (category) =>
            selectedCategories.includes(category.id) &&
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : categories.filter((category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const handleCheckboxChange = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Medicine Categories</h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-2/3 lg:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">Filter Categories</h2>
          <div>
            {categories.map((category) => (
              <div key={category.id} className="mb-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={category.id}
                    onChange={() => handleCheckboxChange(category.id)}
                    checked={selectedCategories.includes(category.id)}
                    className="form-checkbox text-blue-600 rounded"
                  />
                  <span className="text-gray-700">{category.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200 text-center flex flex-col justify-between"
              >
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-gray-700 mb-4">{category.description}</p>
                <div>
                  <strong className="block mb-2 text-gray-900">
                    Available Pharmacies:
                  </strong>
                  <ul className="list-disc list-inside text-gray-600 mb-4">
                    {category.pharmacies.map((pharmacy, index) => (
                      <li key={index}>{pharmacy}</li>
                    ))}
                  </ul>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCategoryPage;

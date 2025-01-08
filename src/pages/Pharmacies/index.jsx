import React, { useState } from 'react';

const PharmacyScreen = () => {
  const [pharmacies, setPharmacies] = useState([
    {
      id: 1,
      name: 'Pharmacy A',
      location: 'Barangay 1, City 1',
      contact: '1234567890',
      hours: 'Mon-Sun (8:00 AM - 8:00 PM)',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: 'Pharmacy B',
      location: 'Barangay 2, City 2',
      contact: '0987654321',
      hours: 'Mon-Fri (9:00 AM - 5:00 PM)',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: 'Pharmacy C',
      location: 'Barangay 3, City 3',
      contact: '1122334455',
      hours: 'Mon-Sat (10:00 AM - 6:00 PM)',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 4,
      name: 'Pharmacy D',
      location: 'Barangay 4, City 4',
      contact: '5566778899',
      hours: '24/7',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 5,
      name: 'Pharmacy E',
      location: 'Barangay 5, City 5',
      contact: '6677889900',
      hours: 'Mon-Sun (7:00 AM - 9:00 PM)',
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const handleSearch = (event) => {
    // Add search functionality here if needed
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Top Section */}
      <div className="bg-blue-50 px-8 py-6 text-white">
        <input
          type="text"
          placeholder="Search pharmacies"
          className="w-full p-3 rounded-lg text-gray-900 shadow-md"
          onChange={handleSearch}
        />
      </div>

      {/* Pharmacies Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <img
                src={pharmacy.image}
                alt={pharmacy.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {pharmacy.name}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  📍 {pharmacy.location}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  ☎️ {pharmacy.contact}
                </p>
                <p className="text-sm text-gray-600">
                  🕒 {pharmacy.hours}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyScreen;

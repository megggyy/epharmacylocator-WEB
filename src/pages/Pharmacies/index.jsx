import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { API_URL } from '../../env';
import { Link } from 'react-router-dom';

const PharmacyScreen = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch pharmacies from the API
    axios
      .get(`${API_URL}pharmacies`)
      .then((response) => {
        const pharmaciesData = response.data;
        
        // Filter pharmacies to include only approved ones
        const approvedPharmacies = pharmaciesData.filter(pharmacy => pharmacy.approved);
        
        setPharmacies(approvedPharmacies);
        setFilteredPharmacies(approvedPharmacies);
        
        // Extract unique barangays from the pharmacies data
        const uniqueBarangays = [
          ...new Set(approvedPharmacies.map((pharmacy) => pharmacy.userInfo.barangay)),
        ];
        setBarangays(uniqueBarangays);
      })
      .catch((error) => {
        console.error('Error fetching pharmacies:', error);
      });
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  
    if (query === '') {
      setFilteredPharmacies(pharmacies);
    } else {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.userInfo.name.toLowerCase().includes(query.toLowerCase()) ||
          pharmacy.userInfo.barangay.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    }
  };
  

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay);
    setDropdownOpen(false);

    // Filter pharmacies by selected barangay
    const filtered = pharmacies.filter(
      (pharmacy) => pharmacy.userInfo.barangay === barangay
    );
    setFilteredPharmacies(filtered);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Top Section */}
      <div className="bg-blue-50 px-8 py-6 text-white">
        <input
          type="text"
          placeholder="Search pharmacies"
          className="w-full p-3 rounded-lg text-gray-900 shadow-md"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyUp={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Barangay Filter */}
      <div className="px-8 py-2">
        <div className="relative z-10">
          <button
            className="bg-gray-200 px-4 py-2 rounded-lg w-full flex justify-between items-center"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <span>{selectedBarangay || 'Select Barangay'}</span>
            <svg
              className={`w-5 h-5 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 z-20">
              {barangays.map((barangay, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleBarangaySelect(barangay)}
                >
                  {barangay}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pharmacies Grid */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <div
              key={pharmacy._id}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              <img
                src={pharmacy?.images?.[0] || 'https://via.placeholder.com/150'}
                alt={pharmacy.userInfo.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {pharmacy.userInfo.name}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  📍 {pharmacy.userInfo.barangay}, {pharmacy.userInfo.city}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  ☎️ {pharmacy.userInfo.contactNumber}
                </p>
                <p className="text-sm text-gray-600">
                  🕒 {pharmacy.businessDays} ({pharmacy?.openingHour || 'N/A'} - {pharmacy?.closingHour || 'N/A'})
                </p>

                {/* View Details Button */}
                <Link to={`/PharmacyDetails/${pharmacy._id}`}>
                  <button className="mt-4 bg-primary-variant text-white px-4 py-2 rounded-lg">
                    View Details
                  </button>
                </Link>           
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyScreen;

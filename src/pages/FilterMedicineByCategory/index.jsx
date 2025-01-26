import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../env';

const CategoryFilterMedications = () => {
  const navigate = useNavigate();
  const { id, name } = useParams(); // Extract category ID and name from URL params
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(false); // Error state

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state
        const response = await axios.get(`${API_URL}medicine?category=${id}`);

        // Filter the medications to match the current category
        const filteredMedications = response.data.filter(
          (medication) => medication.category._id === id
        );

        setMedications(filteredMedications);
      } catch (err) {
        setError('Failed to load medications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white text-white py-4 px-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-lg font-semibold text-primary-default"
        >
          &larr; Back
        </button>
        <h1 className="text-xl font-bold text-primary-default">{name}</h1>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full" role="status">
              <span className="hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-lg text-blue-700">There are no medicines in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {medications.length > 0 ? (
              medications.map((medication) => (
                <div
                  key={medication._id}
                  className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/MedicationDetails/${medication.name}`)}
                >
                  <h2 className="font-bold text-lg text-gray-800">{medication.name}</h2>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-600">No medications found in the "{name}" category.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilterMedications;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../env';

export default function ReadMedicationScreen() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the medication ID from route params
  const [medicationData, setMedicationData] = useState(null);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine/read/${id}`);
        setMedicationData(response.data);
      } catch (error) {
        console.error('Error fetching medication:', error);
        alert('Failed to load medication details');
      }
    };

    if (id) fetchMedication();
  }, [id]);

  if (!medicationData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gray-100 text-white p-6 flex justify-between items-center">
      <button
          onClick={() => navigate(-1)}
          className="text-primary-default text-lg font-bold"
        >
          &larr; Back
        </button>
        <h1 className="text-lg font-bold text-primary-default">{medicationData.name}</h1>
      </div>

      {/* Medication Details */}
      <div className="bg-white rounded-xl p-6 mx-6 my-4 shadow-lg">
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Category:</p>
          <p className="bg-gray-200 rounded-lg p-4 mb-4 text-justify">
            {medicationData.category?.name}
          </p>
        </div>
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Stock:</p>
          <p className="bg-gray-200 rounded-lg p-4 mb-4 text-justify">
            {medicationData.stock}
          </p>
        </div>
      </div>
    </div>
  );
}

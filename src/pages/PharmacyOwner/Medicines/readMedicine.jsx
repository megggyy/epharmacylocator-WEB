import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../env';
import PulseSpinner from "../../../assets/common/spinner";

export default function ReadMedicationScreen() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the medication ID from route params
  const [medicationData, setMedicationData] = useState(null);
  const [category, setCategory] = useState("");
  const [isCategory, setIsCategory] = useState(true); // Toggle state

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

  useEffect(() => {
    if (medicationData?.medicine?.category) {
      const newCategory = Array.isArray(medicationData.medicine.category)
        ? medicationData.medicine.category.map((cat) => cat.name).join('/ ')
        : medicationData.medicine.category?.name || 'No Category';

      setCategory(newCategory);
    }
  }, [medicationData]); // Runs when medicationData updates

  const handleCategoryClick = () => {
    setIsCategory((prev) => !prev); // Toggle between true/false
  };

  if (!medicationData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gray-100 text-white p-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/pharmacy-owner/medicines')}
          className="text-primary-default text-lg font-bold"
        >
          &larr; Back
        </button>
        <h1 className="text-lg font-bold text-primary-default">{medicationData.medicine.brandName}</h1>
      </div>

      {/* Medication Details */}
      <div className="bg-white rounded-xl p-6 mx-6 my-4 shadow-lg">
        {/* Generic Name */}
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Generic Name:</p>
          <p className="bg-gray-200 rounded-lg p-4 mb-4 text-justify">
            {medicationData.medicine.genericName}
          </p>
        </div>

        {/* Dosage Strength */}
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Dosage Strength:</p>
          <p className="bg-gray-200 rounded-lg p-4 mb-4 text-justify">
            {medicationData.medicine.dosageStrength}
          </p>
        </div>

        {/* Dosage Form */}
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Dosage Form:</p>
          <p className="bg-gray-200 rounded-lg p-4 mb-4 text-justify">
            {medicationData.medicine.dosageForm}
          </p>
        </div>

        {/* Classification */}
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Classification:</p>
          <p className="bg-gray-200 rounded-lg p-4 mb-4 text-justify">
            {medicationData.medicine.classification}
          </p>
        </div>

        {/* Category (clickable) */}
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Category:</p>
          <p
            onClick={handleCategoryClick}
            className="bg-gray-200 rounded-lg p-4 mb-4 text-justify cursor-pointer hover:bg-gray-300"
          >
            {isCategory
              ? category || "No Category"
              : medicationData?.medicine?.description || "No Description"}
          </p>
        </div>

{/* ✅ Price Display */}
<div className="mb-4">
  <p className="font-semibold text-xl mb-2">Price:</p>
  <p className="bg-gray-200 rounded-lg p-4 text-justify">
    {medicationData.price != null && medicationData.price !== ''
      ? `₱${parseFloat(medicationData.price).toFixed(2)}`
      : 'Price not indicated'}
  </p>
</div>

        {/* Expiration Dates + Stock */}
        <div className="mb-4">
          <p className="font-semibold text-xl mb-2">Expiration & Stock:</p>
          {medicationData.expirationPerStock?.length > 0 ? (
            medicationData.expirationPerStock.map((exp, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-200 rounded-lg p-4 mb-2"
              >
                <p className="text-justify flex-1">
                  {exp?.expirationDate
                    ? new Date(exp.expirationDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "No Expiration Date"}
                </p>
                <p className="font-semibold ml-4">{exp.stock}</p>
              </div>
            ))
          ) : (
            <p className="bg-gray-200 rounded-lg p-4 text-justify">No Expiration Data</p>
          )}
        </div>
      </div>

    </div>
  );
}

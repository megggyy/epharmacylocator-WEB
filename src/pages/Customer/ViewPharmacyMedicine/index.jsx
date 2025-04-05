import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../env';

const ViewPharmacyMedicine = () => {
  const location = useLocation();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const pharmacyId = queryParams.get('pharmacyId');
  const id = queryParams.get('id'); // The ID of the pharmacy stock

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        if (id && pharmacyId) {
          const response = await axios.get(`${API_URL}medicine/read/${id}`);
          console.log('Fetched response:', response.data);

          // Check if the pharmacyId from the URL matches the one in the response data
          if (response.data.pharmacy && response.data.pharmacy._id === pharmacyId) {
            setStock(response.data);
          } else {
            console.warn('Pharmacy ID mismatch or missing pharmacy data');
            setStock(null);
          }
        }
      } catch (error) {
        console.error('Error fetching stock details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id && pharmacyId) {
      fetchStockDetails();
    } else {
      setLoading(false); // Handle case when parameters are missing
    }
  }, [id, pharmacyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-3xl text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-xl">Medicine stock not found for this pharmacy.</p>
      </div>
    );
  }

  const { medicine, expirationPerStock, timeStamps } = stock;
  const totalStock = expirationPerStock?.reduce((sum, stockItem) => sum + stockItem.stock, 0) || 0;
  const categoryNames = medicine.category ? medicine.category.map((cat) => cat.name).join(' / ') : 'No Category';

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-primary-default text-white p-6 shadow-lg mb-8 flex justify-between items-center">
        <h1 className="text-2xl text-default font-bold text-center w-full text-ellipsis overflow-hidden">{medicine.brandName || 'Unknown Medicine'}</h1>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 mx-4 mb-6">
        <h2 className="text-xl font-semibold text-primary-default mb-4">Medicine Details</h2>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Brand Name:</span>
          <span className="text-gray-600">{medicine.brandName || 'N/A'}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Generic Name:</span>
          <span className="text-gray-600">{medicine.genericName || 'N/A'}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Dosage Strength:</span>
          <span className="text-gray-600">{medicine.dosageStrength || 'N/A'}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Dosage Form:</span>
          <span className="text-gray-600">{medicine.dosageForm || 'N/A'}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Classification:</span>
          <span className="text-gray-600">{medicine.classification || 'N/A'}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Category:</span>
          <span className="text-gray-600">{categoryNames}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <span className="font-semibold text-gray-700">Stock:</span>
          <span className="text-gray-600">{totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}</span>
        </div>
        <p className="text-sm text-red-600 text-right mt-4">
          Last updated on {timeStamps ? new Date(timeStamps).toLocaleString() : 'No Date Available'}
        </p>
      </div>
    </div>
  );
};

export default ViewPharmacyMedicine;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; // Import useLocation to get the pharmacyId
import axios from 'axios';
import { API_URL } from '../../../env';
import PulseSpinner from '../../../assets/common/spinner';

const CustomerCategoryFilterMedications = () => {
  const navigate = useNavigate();
  const { id, name } = useParams(); // Extract category ID and name from URL params
  const location = useLocation(); // To access query params in the URL
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(false); // Error state

  // Extract pharmacyId from query params
  const queryParams = new URLSearchParams(location.search);
  const pharmacyId = queryParams.get('pharmacyId');

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}medicine/category/${id}`);
        console.log('Fetched meds:', response.data);
        setMedications(response.data); // assuming response is already filtered
      } catch (err) {
        console.error(err);
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
        <h1 className="text-xl font-bold text-primary-default">{name}</h1>
      </div>

      <div className="p-6">
        {isLoading ? (
         <PulseSpinner/>
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
                  onClick={() => {   
                      navigate(`/customer/viewpharmacymedicine?id=${medication._id}&pharmacyId=${pharmacyId}`);                   
                  }}
                >
                  <h2 className="font-bold text-lg text-gray-800">{medication.brandName}</h2>
                  <p className="text-gray-700">💊 Generic: {medication.genericName}</p>
                  <p className="text-gray-600">💉 Dosage: {medication.dosageStrength} {medication.dosageForm}</p>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(medication.description) ? medication.description.join(', ') : medication.description}
                  </p>
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

export default CustomerCategoryFilterMedications;

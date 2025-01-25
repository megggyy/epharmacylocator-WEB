import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../../env';
import AuthGlobal from '@/context/AuthGlobal';

export default function PharmacyOwnerDashboard() {
  const [totalMedications, setTotalMedications] = useState(0);
  const [medicationData, setMedicationData] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const { state } = useContext(AuthGlobal);
  const navigate = useNavigate();

  // Fetch user data and medications
  useEffect(() => {
    if (state.isAuthenticated) {
      // Fetch user profile data
      axios
        .get(`${API_URL}users/${state.user.userId}`)
        .then((res) => {
          setUserProfile(res.data);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });

      // Fetch medications data for the logged-in pharmacy
      axios
        .get(`${API_URL}medicine/${state.user.userId}`)
        .then((res) => {
          const medications = res.data;
          setTotalMedications(medications.length); // Count the medications related to this pharmacy
        })
        .catch((err) => {
          console.error("Error fetching medications:", err);
        });
    } else {
      navigate('/login'); // Redirect if not authenticated
    }
  }, [state.isAuthenticated, state.user.userId]);

  // Sample data for medication categories (you can replace this with your API data)
  useEffect(() => {
    const sampleData = [
      { category: "Antibiotics", count: 40 },
      { category: "Pain Relievers", count: 25 },
      { category: "Vitamins", count: 30 },
      { category: "Cough", count: 20 },
      { category: "Allergy", count: 15 }
    ];
    setMedicationData(sampleData);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center p-6 bg-gray-100">     
          <h1 className="text-primary-default text-xl font-bold">Welcome to your Dashboard.</h1>        
      </div>

      {/* Total Medications Summary */}
      <div className="bg-white mx-5 mt-5 p-6 rounded-lg shadow-md text-center">
        <h2 className="text-gray-600">Total Medications</h2>
        <p className="text-4xl font-bold text-primary-variant">{totalMedications}</p>
      </div>

      {/* Medications per Category Chart */}
      <h3 className="text-xl font-semibold text-gray-700 mt-5 ml-5">Medications per Category</h3>
      <div className="mt-4 mx-5">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={medicationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0B607E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Manage Medications Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate('/screens/PharmacyOwner/Medications/ListMedications')}
          className="flex items-center bg-primary-variant text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          <span className="font-bold mr-2">Manage Medications</span>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

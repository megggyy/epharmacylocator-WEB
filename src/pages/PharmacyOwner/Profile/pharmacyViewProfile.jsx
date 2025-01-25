import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import PulseSpinner from '../../../assets/common/spinner';
import { API_URL } from '../../../env';

const OwnerViewProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('User not logged in');

        const decoded = jwtDecode(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error('User ID not found in token');

        const response = await fetch(`${API_URL}users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();

        const disease = data.customerDetails?.disease?.name || 'N/A';
        setUserData({ ...data, disease });
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const address = `${userData.street || ''}, ${userData.barangay || ''}, ${userData.city || ''}`
    .replace(/(, )+/g, ', ')
    .trim();

  const profileImage =
    userData?.pharmacyDetails?.images?.[0] && typeof userData.pharmacyDetails.images[0] === 'string'
      ? userData.pharmacyDetails.images[0]
      : '/path/to/sample.jpg'; // Replace with your default image path

  return (
    <div className="min-h-screen bg-gray-100">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <PulseSpinner />
        </div>
      ) : (
        <>
          <div className="bg-gray-100 text-white py-5 px-4 flex items-center">
            <h1 className="text-xl font-bold text-primary-default">View Profile</h1>
          </div>

          <div className="flex flex-col items-center mt-8">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6 mx-4">
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Name</label>
              <input
                type="text"
                className="w-full bg-gray-200 rounded-md p-2"
                value={userData.name || ''}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Email</label>
              <input
                type="text"
                className="w-full bg-gray-200 rounded-md p-2"
                value={userData.email || ''}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Mobile Number</label>
              <input
                type="text"
                className="w-full bg-gray-200 rounded-md p-2"
                value={userData.contactNumber || ''}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Address</label>
              <input
                type="text"
                className="w-full bg-gray-200 rounded-md p-2"
                value={address || 'N/A'}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Business Days</label>
              <input
                type="text"
                className="w-full bg-gray-200 rounded-md p-2"
                value={userData.pharmacyDetails?.businessDays || 'N/A'}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Store Hours</label>
              <input
                type="text"
                className="w-full bg-gray-200 rounded-md p-2"
                value={`${userData.pharmacyDetails?.openingHour || 'N/A'} - ${userData.pharmacyDetails?.closingHour || 'N/A'}`}
                readOnly
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerViewProfile;

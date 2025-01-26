import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PulseSpinner from '../../../assets/common/spinner';
import { API_URL } from '../../../env';
import { ToastContainer } from 'react-toastify';

export default function CustomerViewProfile() {
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
    userData?.customerDetails?.images?.[0] && typeof userData.customerDetails.images[0] === 'string'
      ? userData.customerDetails.images[0]
      : '/path/to/sample.jpg'; // Replace with actual path to default image

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <PulseSpinner />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gray-100 text-white py-6 text-center relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 text-primary-default"
            >
              &larr; Back
            </button>
            <h1 className="text-2xl font-semibold text-primary-default">View Profile</h1>
          </div>

          {/* Profile Image Section */}
          <div className="flex flex-col items-center mt-6">
            <img
              src={profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          </div>

          {/* Profile Details */}
          <div className="bg-white mx-4 rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={userData.name || ''}
                readOnly
                className="w-full bg-gray-100 border rounded px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={userData.email || ''}
                readOnly
                className="w-full bg-gray-100 border rounded px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Mobile Number</label>
              <input
                type="text"
                value={userData.contactNumber || ''}
                readOnly
                className="w-full bg-gray-100 border rounded px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Address</label>
              <input
                type="text"
                value={address || 'N/A'}
                readOnly
                className="w-full bg-gray-100 border rounded px-4 py-2"
              />
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => navigate('/customer/editProfile')} // Replace with your edit profile route
                className="bg-primary-default text-white px-6 py-2 rounded-lg shadow-md hover:bg-primary-dark"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import PulseSpinner from '../../../assets/common/spinner';
import { API_URL } from '../../../env';
import defaultImage from '@assets/epharmacylogoblue.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomerEditProfile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [barangays, setBarangays] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('User not logged in');

        const decoded = jwtDecode(token);
        const userId = decoded?.userId;

        if (!userId) throw new Error('User ID not found in token');

        const response = await axios.get(`${API_URL}users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { name, email, contactNumber, street, barangay, city, customerDetails } = response.data;
        setUserId(userId);
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setStreet(street || '');
        setBarangay(barangay || '');
        setCity(city || '');

        setImages(customerDetails?.images || []);
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchBarangays = async () => {
      try {
        const response = await axios.get(`${API_URL}barangays`);
        setBarangays(response.data);
      } catch (error) {
        console.error('Error fetching barangays:', error);
      }
    };

    fetchUserData();
    fetchBarangays();
  }, []);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleDeleteImage = (image) => {
    setImages(images.filter((img) => img !== image));
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('User not logged in');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('contactNumber', mobile);
      formData.append('street', street);
      formData.append('barangay', barangay);
      formData.append('city', city);

      images.forEach((image) => {
        formData.append('images', image);
      });

      await axios.put(`${API_URL}users/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile updated successfully');
      navigate('/customer/viewProfile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <PulseSpinner />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="bg-gray-100 text-white py-4 px-6 rounded-lg mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="font-semibold text-lg text-primary-default"
            >
              &larr; Back
            </button>
            <h1 className="text-xl font-bold text-primary-default">Edit Profile</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={image || defaultImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                    onClick={() => handleDeleteImage(image)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <label className="cursor-pointer bg-gray-200 rounded-lg p-4 flex items-center justify-center w-24 h-24">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
                + Add Image
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-4 py-2 bg-gray-100 cursor-not-allowed"
                  value={email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Mobile Number</label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Street</label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Barangay</label>
                <select
                  className="w-full border rounded px-4 py-2"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={handleConfirm}
                className="w-full bg-primary-variant text-white py-2 rounded-lg font-semibold hover:bg-blue-800"
              >
                Confirm
              </button>
              <button
                onClick={() => navigate('/customer/change-password')} // Replace with your route
                className="w-full bg-secondary-variant text-white py-2 rounded-lg font-semibold hover:bg-blue-800"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import PulseSpinner from '../../../assets/common/spinner';
import { API_URL } from '../../../env';
import defaultImage from '@assets/epharmacylogoblue.png';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';

const LocationMarker = ({ position, setPosition, setAddress }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position]);

  const handleDragEnd = async (e) => {
    const newPos = e.target.getLatLng();
    setPosition(newPos);
    fetchAddress(newPos.lat, newPos.lng);
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const addr = res.data.address;
  
      // Pick only the desired fields
      const relevantParts = [
        addr.road,
        addr.neighbourhood,
        addr.city_district,
        addr.county,
        addr.postcode,
        addr.country,
      ].filter(Boolean); // remove undefined/null values
  
      // Join to form a short address
      setAddress(relevantParts.join(', '));
    } catch {
      setAddress('Unknown Location');
    }
  };
  

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{ dragend: handleDragEnd }}
      
    />
  );
};

export default function CustomerEditProfile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [images, setImages] = useState([]);
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState({ lat: 14.5995, lng: 120.9842 }); // Default: Manila
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('User not logged in');
        const decoded = jwtDecode(token);
        const userId = decoded?.userId;

        const res = await axios.get(`${API_URL}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, contactNumber, customerDetails } = res.data;
        setUserId(userId);
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setImages(customerDetails?.images || []);
        if (customerDetails?.address) {
          setAddress(customerDetails.address);
        }
        if (customerDetails?.latitude && customerDetails?.longitude) {
          setPosition({ lat: customerDetails.latitude, lng: customerDetails.longitude });
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setPosition({ lat: latitude, lng: longitude });

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          setAddress(res.data.display_name);
        } catch {
          setAddress('Unknown Location');
        }
      },
      () => toast.error('Permission denied')
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleDeleteImage = (img) => {
    setImages(images.filter((i) => i !== img));
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('contactNumber', mobile);
      formData.append('address', address);
      formData.append('latitude', position.lat);
      formData.append('longitude', position.lng);

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
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
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
            <button onClick={() => navigate(-1)} className="font-semibold text-lg text-primary-default">
              &larr; Back
            </button>
            <h1 className="text-xl font-bold text-primary-default">Edit Profile</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Images */}
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={img || defaultImage} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                  <button
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                    onClick={() => handleDeleteImage(img)}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <label className="cursor-pointer bg-gray-200 rounded-lg p-4 flex items-center justify-center w-24 h-24">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                + Add Image
              </label>
            </div>

            {/* Inputs */}
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
                <input type="email" disabled className="w-full border rounded px-4 py-2 bg-gray-100" value={email} />
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
                <label className="block text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full border rounded px-4 py-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Map + Button */}
            <div className="my-4">
              <button
                onClick={handleGetCurrentLocation}
                className="mb-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Get Current Location
              </button>

              <MapContainer center={position} zoom={16} scrollWheelZoom={false} className="h-64 rounded-lg">
                <TileLayer
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
              </MapContainer>
            </div>

            {/* Buttons */}
            <div className="mt-6 space-y-4">
              <button
                onClick={handleConfirm}
                className="w-full bg-primary-variant text-white py-2 rounded-lg font-semibold hover:bg-blue-800"
              >
                Confirm
              </button>
              <button
                onClick={() => navigate('/customer/change-password')}
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

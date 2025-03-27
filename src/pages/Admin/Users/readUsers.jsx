import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../env";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReadUserScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${API_URL}users/${id}`);
          setUser(response.data);
        } catch (err) {
          console.error("Error fetching user details:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  const updateRole = async (id) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}users/admins/updateRole/${id}`);
      toast.success("USER ROLE UPDATED");
      navigate('/admin/users');
    } catch (err) {
      toast.error("FAILED TO UPDATE USER ROLE");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg font-semibold mb-4">User not found!</p>
        <button
          className="bg-[#0B607E] text-white py-2 px-4 rounded-lg font-medium"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-[#0B607E] text-white py-4 px-6 rounded-lg flex items-center justify-between">
        <button
          className="text-white font-medium text-lg"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">{user.name.toUpperCase()}</h1>
      </div>

      {/* User Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        {/* Image Carousel */}
        <div className="flex overflow-x-auto space-x-4 mb-6">
          {user.customerDetails?.images?.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`User Image ${index + 1}`}
              className="w-72 h-72 rounded-lg cursor-pointer object-cover"
              onClick={() => handleImagePress(image)}
            />
          ))}
        </div>

        {/* Modal for Expanded Image */}
        {isModalVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closeImageModal}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected"
                className="w-[400px] h-[400px] rounded-lg object-cover"
              />
            )}
          </div>
        )}

        {/* User Details */}
        <div>
          <label className="block text-gray-600 font-semibold mb-2">Email</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-2 w-full mb-4"
            value={user.email}
            readOnly
          />

          <label className="block text-gray-600 font-semibold mb-2">Mobile Number</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-2 w-full mb-4"
            value={user.contactNumber}
            readOnly
          />

          <label className="block text-gray-600 font-semibold mb-2">Address</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-2 w-full mb-4"
            value={user.address || "N/A"}
            readOnly
          />
        </div>

        {/* Make Admin Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => updateRole(user._id)}
        >
          MAKE ADMIN
        </button>
      </div>
    </div>
  );
};

export default ReadUserScreen;

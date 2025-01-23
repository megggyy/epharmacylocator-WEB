import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../../../env';

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }

    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${API_URL}medication-category/${id}`);
        const category = response.data;
        setName(category.name);
        setDescription(category.description);
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category details');
      }
    };

    if (id) fetchCategory();
  }, [id]);

  const handleConfirm = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${API_URL}medication-category/update/${id}`, formData, config);
      toast.success('Category updated successfully!', { autoClose: 3000 });
      navigate('/admin/medication-category');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category!', { autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-6">
      {/* Header */}
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <button
          className="text-white font-medium text-lg"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <div>
          <h1 className="text-2xl font-bold">Edit Category</h1>
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-white rounded-lg shadow-md p-6 mx-4 my-6">
        <label className="block text-gray-600 mb-2">Category Name</label>
        <input
          type="text"
          className="border border-gray-300 rounded-md p-2 w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
        />

        <label className="block text-gray-600 mb-2">Description</label>
        <textarea
          className="border border-gray-300 rounded-md p-2 w-full mb-4 h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        ></textarea>

        <button
          className="bg-[#0B607E] text-white py-2 px-4 rounded-md font-medium w-full"
          onClick={handleConfirm}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default EditCategory;

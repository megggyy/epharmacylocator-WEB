import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";

const ReadCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${API_URL}medication-category/${id}`);
        setCategoryData(response.data);
      } catch (error) {
        console.error("Error fetching category:", error);
        toast.error("Failed to load category details", { autoClose: 3000 });
      }
    };
    if (id) fetchCategory();
  }, [id]);

  if (!categoryData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Category Details</h1>
      </div>

      {/* Category Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mx-4 my-6">
        <div className="mb-4">
          <span className="font-bold text-lg">Name:</span>
          <p className="bg-gray-200 p-2 rounded mt-1">{categoryData.name}</p>
        </div>

        <div>
          <span className="font-bold text-lg">Description:</span>
          <p className="bg-gray-200 p-2 rounded mt-1">{categoryData.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ReadCategory;

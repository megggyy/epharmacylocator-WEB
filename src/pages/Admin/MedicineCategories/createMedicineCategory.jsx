import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";

const CreateCategory = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${API_URL}medication-category/create`, formData, config);

      const toastProps = {
        autoClose: 3000,
      };

      if (response.data) {
        toast.success("Category created successfully!", toastProps);
        navigate("/admin/medication-category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      const toastProps = {      
        autoClose: 3000,
      };
      toast.error("Failed to create category! Please try again.", toastProps);
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
          <h1 className="text-2xl font-bold">Create Category</h1>
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
          onClick={handleCreate}
        >
          CREATE
        </button>
      </div>
    </div>
  );
};

export default CreateCategory;

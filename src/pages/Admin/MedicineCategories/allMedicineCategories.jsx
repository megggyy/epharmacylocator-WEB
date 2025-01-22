import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import PulseSpinner from "../../../assets/common/spinner";
import { API_URL } from "../../../env";

const MedicationCategoriesScreen = () => {
  const navigate = useNavigate();
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchCategories = (text) => {
    if (text === "") {
      setCategoriesFilter(categoriesList);
    } else {
      setCategoriesFilter(
        categoriesList.filter((category) =>
          category.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}medication-category`);
      setCategoriesList(response.data);
      setCategoriesFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_URL}medication-category/delete/${categoryId}`);
        setCategoriesList((prev) =>
          prev.filter((category) => category._id !== categoryId)
        );
        setCategoriesFilter((prev) =>
          prev.filter((category) => category._id !== categoryId)
        );
        alert("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-500 hover:underline"
            onClick={() =>
              navigate(`/screens/Admin/MedicationCategory/EditCategory?id=${row._id}`)
            }
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:underline"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#0B607E",
        color: "white",
      },
    },
    rows: {
      style: {
        backgroundColor: "#F5F5F5",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#E6F7FF",
        transition: "all 0.3s ease",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ePharmacy</h1>
        </div>
        <button
          className="bg-white text-[#0B607E] px-4 py-2 rounded-md font-medium"
          onClick={() => navigate("/screens/Admin/MedicationCategory/CreateCategory")}
        >
          Create Category
        </button>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Search Name"
          className="border rounded-md p-2 w-full mb-4"
          onChange={(e) => searchCategories(e.target.value)}
          onKeyUp={(e) => searchCategories(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PulseSpinner /> {/* Replace with a TailwindCSS spinner or equivalent */}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categoriesFilter}
          customStyles={customStyles}
          pagination
          highlightOnHover
        />
      )}
    </div>
  );
};

export default MedicationCategoriesScreen;

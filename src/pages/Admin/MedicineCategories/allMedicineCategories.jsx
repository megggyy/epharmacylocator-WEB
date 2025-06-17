import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PulseSpinner from "../../../assets/common/spinner";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    const response = await axios.get(
      `${API_URL}medication-category?includeDeleted=true`
    );
    const reversedData = [...response.data].reverse(); // ✅ Reverse the list
    setCategoriesList(reversedData);
    setCategoriesFilter(reversedData);
    setLoading(false);
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Failed to load categories");
  }
}, []);


  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggleDelete = async (category) => {
    const isDeleted = category.deleted;
    const action = isDeleted ? "restore" : "soft-delete";

    const confirmMsg = isDeleted
      ? "Are you sure you want to restore this category?"
      : "Are you sure you want to delete this category?";

    if (window.confirm(confirmMsg)) {
      try {
        await axios.put(`${API_URL}medication-category/${action}/${category._id}`);
        fetchCategories();
        toast.success(`Category ${isDeleted ? "restored" : "deleted"} successfully`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update category");
      }
    }
  };

  const columns = [
    {
      name: "NAME",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <button
          className="text-black hover:underline"
          onClick={() => navigate(`/admin/medication-category/read/${row._id}`)}
        >
          {row.name}
        </button>
      ),
    },
    {
      name: "STATUS",
      selector: (row) => (row.deleted ? "Deleted" : "Active"),
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.deleted ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"
          }`}
        >
          {row.deleted ? "Deleted" : "Active"}
        </span>
      ),
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => navigate(`/admin/medication-category/edit/${row._id}`)}
            disabled={row.deleted}
          >
            Edit
          </button>
          <button
            className={
              row.deleted
                ? "text-green-500 hover:underline"
                : "text-red-500 hover:underline"
            }
            onClick={() => handleToggleDelete(row)}
          >
            {row.deleted ? "Restore" : "Delete"}
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
      <ToastContainer />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PulseSpinner />
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Medicine Categories</h1>
            </div>
            <button
              className="bg-white text-[#0B607E] px-4 py-2 rounded-md font-medium"
              onClick={() => navigate("/admin/medication-category/create")}
            >
              Create Category
            </button>
          </div>

          {/* Search Input */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search Name"
              className="border rounded-md p-2 w-full mb-4"
              onChange={(e) => searchCategories(e.target.value)}
              onKeyUp={(e) => searchCategories(e.target.value)}
            />
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={categoriesFilter}
            customStyles={customStyles}
            pagination
            highlightOnHover
          />
        </>
      )}
    </div>
  );
};

export default MedicationCategoriesScreen;

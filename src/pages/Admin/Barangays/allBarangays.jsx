import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

const BarangaysScreen = () => {
  const navigate = useNavigate();
  const [barangayList, setBarangayList] = useState([]);
  const [barangayFilter, setBarangayFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchBarangay = (text) => {
    if (text === "") {
      setBarangayFilter(barangayList);
    } else {
      setBarangayFilter(
        barangayList.filter((i) =>
          i.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const fetchBarangays = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}barangays`);
      setBarangayList(response.data);
      setBarangayFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  }, []);

  useEffect(() => {
    fetchBarangays();
  }, [fetchBarangays]);

  const handleDelete = async (barangayId) => {
    if (window.confirm("Are you sure you want to delete this barangay?")) {
      try {
        await axios.delete(`${API_URL}barangays/delete/${barangayId}`);
        setBarangayList((prev) =>
          prev.filter((barangay) => barangay._id !== barangayId)
        );
        setBarangayFilter((prev) =>
          prev.filter((barangay) => barangay._id !== barangayId)
        );
        toast.success("Barangay deleted successfully"); // Success toast
      } catch (error) {
        console.error("Error deleting barangay:", error);
        toast.error("Failed to delete barangay"); // Error toast
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
          onClick={() => navigate(`/admin/barangays/read/${row._id}`)} // Navigate to Read Barangay screen
        >
          {row.name}
        </button>
      ),
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center space-x-4">
         <button
          className="text-blue-500 hover:underline"
          onClick={() => navigate(`/admin/barangays/edit/${row._id}`)} // Directly pass the id as part of the URL
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
        backgroundColor: "#0B607E", // matching the color scheme
        color: "white",
      },
    },
    rows: {
      style: {
        backgroundColor: "#F5F5F5",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#E6F7FF", // matching the hover color scheme
        transition: "all 0.3s ease",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Barangays</h1>
        </div>
        <button
          className="bg-white text-[#0B607E] px-4 py-2 rounded-md font-medium"
          onClick={() => navigate("/admin/barangays/create")}
        >
          Create Barangay
        </button>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Search Name"
          className="border rounded-md p-2 w-full mb-4"
          onChange={(e) => searchBarangay(e.target.value)}
          onKeyUp={(e) => searchBarangay(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PulseSpinner /> {/* Using the PulseSpinner component */}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={barangayFilter}
          customStyles={customStyles}
          pagination
          highlightOnHover
        />
      )}
    </div>
  );
};

export default BarangaysScreen;

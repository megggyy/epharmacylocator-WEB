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
    setBarangayFilter(
      text === ""
        ? barangayList
        : barangayList.filter((i) =>
            i.name.toLowerCase().includes(text.toLowerCase())
          )
    );
  };

  const fetchBarangays = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}barangays?includeDeleted=true`);
      setBarangayList(response.data);
      setBarangayFilter(response.data);
    } catch (error) {
      console.error("Error fetching barangays:", error);
      toast.error("Failed to load barangays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBarangays();
  }, [fetchBarangays]);

  const handleDelete = async (barangayId) => {
    if (window.confirm("Are you sure you want to delete this barangay?")) {
      try {
        await axios.delete(`${API_URL}barangays/delete/${barangayId}`);
        toast.success("Barangay soft deleted successfully");
        fetchBarangays();
      } catch (error) {
        console.error("Error deleting barangay:", error);
        toast.error("Failed to delete barangay");
      }
    }
  };

  const handleRestore = async (barangayId) => {
    try {
      await axios.put(`${API_URL}barangays/restore/${barangayId}`);
      toast.success("Barangay restored successfully");
      fetchBarangays();
    } catch (error) {
      console.error("Error restoring barangay:", error);
      toast.error("Failed to restore barangay");
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
          onClick={() => navigate(`/admin/barangays/read/${row._id}`)}
        >
          {row.name}
        </button>
      ),
    },
    {
      name: "STATUS",
      selector: (row) => (row.deleted ? "Deleted" : "Active"),
      sortable: true,
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center space-x-4">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => navigate(`/admin/barangays/edit/${row._id}`)}
            disabled={row.deleted}
          >
            Edit
          </button>
          {!row.deleted ? (
            <button
              className="text-red-500 hover:underline"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button>
          ) : (
            <button
              className="text-green-500 hover:underline"
              onClick={() => handleRestore(row._id)}
            >
              Restore
            </button>
          )}
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
        <PulseSpinner />
      ) : (
        <>
          <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
            <h1 className="text-2xl font-bold">Barangays</h1>
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
            />
          </div>

          <DataTable
            columns={columns}
            data={barangayFilter}
            customStyles={customStyles}
            pagination
            highlightOnHover
          />
        </>
      )}
    </div>
  );
};

export default BarangaysScreen;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import PulseSpinner from "../../../assets/common/spinner";
import { API_URL } from "../../../env";

const PharmaciesScreen = () => {
  const navigate = useNavigate();
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [pharmaciesFilter, setPharmaciesFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchPharmacies = (text) => {
    if (text === "") {
      setPharmaciesFilter(pharmaciesList);
    } else {
      setPharmaciesFilter(
        pharmaciesList.filter((pharmacy) =>
          pharmacy.userInfo.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const fetchPharmacies = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}pharmacies`);
      setPharmaciesList(response.data);
      setPharmaciesFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
    }
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const handleDelete = async (pharmacyId) => {
    if (window.confirm("Are you sure you want to delete this pharmacy?")) {
      try {
        await axios.delete(`${API_URL}pharmacies/delete/${pharmacyId}`);
        setPharmaciesList((prev) =>
          prev.filter((pharmacy) => pharmacy._id !== pharmacyId)
        );
        setPharmaciesFilter((prev) =>
          prev.filter((pharmacy) => pharmacy._id !== pharmacyId)
        );
        alert("Pharmacy deleted successfully");
      } catch (error) {
        console.error("Error deleting pharmacy:", error);
        alert("Failed to delete pharmacy");
      }
    }
  };

  const columns = [
    {
      name: "Permits",
      selector: (row) => (
        <img
          src={row.images[0]}
          alt="Pharmacy"
          className="w-10 h-10 object-cover rounded-full"
        />
      ),
      sortable: true,
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.userInfo.name,
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) =>
        `${row.userInfo.street}, ${row.userInfo.barangay}, ${row.userInfo.city}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (row.approved ? "Approved" : "Pending"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => navigate(`/admin/pharmacies/read/${row._id}`)}
          className="text-blue-600 hover:text-blue-800"
        >
          View
        </button>
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
          onClick={() => navigate("/screens/Admin/Pharmacies/CreatePharmacy")}
        >
          Create Pharmacy
        </button>
      </div>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Search Name"
          className="border rounded-md p-2 w-full mb-4"
          onChange={(e) => searchPharmacies(e.target.value)}
          onKeyUp={(e) => searchPharmacies(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PulseSpinner /> {/* Replace with a TailwindCSS spinner or equivalent */}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={pharmaciesFilter}
          customStyles={customStyles}
          pagination
          highlightOnHover
        />
      )}
    </div>
  );
};

export default PharmaciesScreen;

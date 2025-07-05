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
  const [runningCheck, setRunningCheck] = useState(false); // 👈 added

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
      const reversedData = [...response.data].reverse();
      setPharmaciesList(reversedData);
      setPharmaciesFilter(reversedData);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  // ✅ Handle Expiry Check Button
  const handleRunExpiryCheck = async () => {
    setRunningCheck(true);
    try {
      await axios.post(`${API_URL}pharmacies/run-expiry-check`);
      alert("Expiry notifications sent to pharmacies.");
    } catch (error) {
      console.error("Error sending expiry alerts:", error);
      alert("Failed to send expiry alerts.");
    } finally {
      setRunningCheck(false);
    }
  };

  const columns = [
    {
      name: "Permits",
      selector: (row) => (
        <img
          src={row.images?.[0] || "https://via.placeholder.com/100"}
          alt="Pharmacy"
          className="w-10 h-10 object-cover rounded-full"
        />
      ),
      sortable: true,
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.userInfo?.name || "N/A",
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) =>
        `${row.userInfo?.street || "N/A"}, ${row.userInfo?.barangay || "N/A"}, ${row.userInfo?.city || "N/A"}`,
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PulseSpinner />
        </div>
      ) : (
        <>
          <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pharmacies</h1>
          </div>

          {/* 🟡 Search & Button Row */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <input
              type="text"
              placeholder="Search Name"
              className="border rounded-md p-2 w-full md:w-1/2"
              onChange={(e) => searchPharmacies(e.target.value)}
            />
            <button
              onClick={handleRunExpiryCheck}
              disabled={runningCheck}
              className={`bg-[#0B607E] text-white px-4 py-2 rounded-md ${
                runningCheck ? "opacity-50 cursor-not-allowed" : "hover:bg-[#094b61]"
              }`}
            >
              {runningCheck ? "Sending..." : "Send Expiry Alerts"}
            </button>
          </div>

          <div className="mt-4">
            <DataTable
              columns={columns}
              data={pharmaciesFilter}
              customStyles={customStyles}
              pagination
              highlightOnHover
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PharmaciesScreen;

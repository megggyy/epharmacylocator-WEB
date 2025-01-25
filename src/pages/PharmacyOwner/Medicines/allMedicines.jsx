import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";
import AuthGlobal from "@/context/AuthGlobal";

const MedicationScreen = () => {
  const navigate = useNavigate();
  const { state } = useContext(AuthGlobal);

  const [medicationsList, setMedicationsList] = useState([]);
  const [medicationsFilter, setMedicationsFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}medicine/${state.user.userId}`);
      setMedicationsList(response.data);
      setMedicationsFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medications:", error);
      setLoading(false);
    }
  }, [state.user.userId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const searchMedications = (text) => {
    if (text === "") {
      setMedicationsFilter(medicationsList);
    } else {
      setMedicationsFilter(
        medicationsList.filter((med) =>
          med.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const handleDelete = async (medicationId) => {
    try {
      await axios.delete(`${API_URL}medicine/delete/${medicationId}`);
      setMedicationsList(medicationsList.filter((med) => med._id !== medicationId));
      setMedicationsFilter(medicationsFilter.filter((med) => med._id !== medicationId));
      toast.success("Medication deleted successfully");
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error("Failed to delete medication");
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category.name,
      sortable: true,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      sortable: true,
    },
    {
        name: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => navigate(`/pharmacy-owner/medicines/edit/${row._id}`)}
            >
              Edit
            </button>
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={() => navigate(`/pharmacy-owner/medicines/read/${row._id}`)} // View Button
            >
              View
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ];

  return (
    <div className="p-6">
      {loading ? (
        <PulseSpinner /> // Replace with your spinner component
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Your Medicines</h1>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by Name"
                onChange={(e) => searchMedications(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <button
                className="bg-primary-variant text-white px-4 py-2 rounded"
                onClick={() => navigate("/pharmacy-owner/medicines/create")}
              >
                Add Medicine
              </button>
            </div>
          </div>
          <DataTable
            title="Medicines"
            columns={columns}
            data={medicationsFilter}
            pagination
            highlightOnHover
            customStyles={{
              header: { style: { backgroundColor: "#0B607E", color: "white" } },
              rows: {
                style: {
                  '&:nth-of-type(odd)': { backgroundColor: 'lightgray' },
                  '&:nth-of-type(even)': { backgroundColor: 'white' }
                }
              }
            }}
          />
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default MedicationScreen;

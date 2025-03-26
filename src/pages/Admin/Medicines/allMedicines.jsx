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
      const response = await axios.get(`${API_URL}medicine`);
      setMedicationsList(response.data);
      setMedicationsFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medications:", error);
      setLoading(false);
    }

    fetchMedications();

      const interval = setInterval(fetchMedications, 5000);
  
      return () => {
        clearInterval(interval); 
        fetchMedications()
        setLoading(true);
      };
  }, [state.user.userId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const searchMedications = (text) => {
    if (text === "") {
      setMedicationsFilter(medicationsList);
    } else {
      setMedicationsFilter(
        medicationsList.filter((i) =>
          [i.medicine?.genericName, i.medicine?.brandName] // Ensure you're accessing the correct structure
            .some((field) => field?.toLowerCase().includes(text.toLowerCase()))
        )
      );
    }
  };

  const columns = [
    {
      name: "Generic Name",
      selector: (row) => row.genericName,
      sortable: true,
    },
    {
      name: "Brand Name",
      selector: (row) => row.brandName,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category.map(cat => cat.name).join("/ "),
      sortable: true,
    },
    {
        name: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <button
              className="bg-green-500 text-white px-2 py-1 rounded"
              onClick={() => navigate(`/admin/medicines/read/${row._id}`)} // View Button
            >
              View
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
              <h1 className="text-2xl font-bold">Medicines</h1>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by Name"
                onChange={(e) => searchMedications(e.target.value)}
                className="border rounded px-3 py-2"
              />
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

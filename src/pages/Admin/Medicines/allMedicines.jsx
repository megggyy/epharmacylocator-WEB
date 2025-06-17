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
      setLoading(true);
      const response = await axios.get(`${API_URL}medicine`);
      const reversedMedications = response.data.reverse(); 
      setMedicationsList(reversedMedications);
      setMedicationsFilter(reversedMedications); 
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
    }
  }, [state.user.userId]);


  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const searchMedications = (text) => {
    if (!text.trim()) {
      setMedicationsFilter(medicationsList); // Reset to full list
      return;
    }

    const filtered = medicationsList.filter((med) =>
      [med.genericName, med.brandName]
        .some((field) => field?.toLowerCase().includes(text.toLowerCase()))
    );

    setMedicationsFilter(filtered);
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
            onClick={() => navigate(`/admin/medicines/read/${row._id}`)}
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <ToastContainer />
      {loading ? (
        <PulseSpinner />
      ) : (
        <>
          <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
            <h1 className="text-2xl font-bold">Medicines</h1>
          </div>

          <div className="mt-6">
            <input
              type="text"
              placeholder="Search Generic Name or Brand Name"
              className="border rounded-md p-2 w-full mb-4"
              onChange={(e) => searchMedications(e.target.value)}
            />
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
                  "&:nth-of-type(odd)": { backgroundColor: "lightgray" },
                  "&:nth-of-type(even)": { backgroundColor: "white" },
                },
              },
            }}
          />
        </>
      )}
    </div>
  );
};

export default MedicationScreen;

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
    const response = await axios.get(
      `${API_URL}medicine/${state.user.userId}?includeDeleted=true`
    );

    const reversed = [...response.data].reverse(); // reverse the array order

    setMedicationsList(reversed);
    setMedicationsFilter(reversed);
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
          medicationsList.filter((i) =>
            [i.medicine?.genericName, i.medicine?.brandName].some((field) =>
              field?.toLowerCase().includes(text.toLowerCase())
            )
          )
        );
      }
    };


  const handleToggleDelete = async (id, isDeleted) => {
    const confirm = window.confirm(
      isDeleted ? "Restore this medicine?" : "Delete this medicine?"
    );
    if (!confirm) return;

    try {
      const action = isDeleted ? "restore" : "soft-delete";
      await axios.put(`${API_URL}medicine/${action}/${id}`);
      toast.success(`Medicine ${isDeleted ? "restored" : "deleted"} successfully`);

      // ✅ Await fetch and show loading
      setLoading(true);
      await fetchMedications();
    } catch (err) {
      console.error("Toggle delete error:", err);
      toast.error("Failed to update medicine");
    }
  };


  const columns = [
    {
      name: "Generic Name",
      selector: (row) => row.medicine.genericName,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.medicine.brandName,
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.medicine.category.map(cat => cat.name).join("/ "),
      sortable: true,
    },
    {
      name: "Stock",
      selector: (row) =>
        row.expirationPerStock.reduce((sum, exp) => sum + exp.stock, 0),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (row.deleted ? "Deleted" : "Active"),
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.deleted
              ? "bg-red-200 text-red-700"
              : "bg-green-200 text-green-700"
          }`}
        >
          {row.deleted ? "Deleted" : "Active"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={() =>
              navigate(`/pharmacy-owner/medicines/edit/${row._id}`)
            }
            disabled={row.deleted}
          >
            Edit
          </button>
          <button
            className="bg-green-500 text-white px-2 py-1 rounded"
            onClick={() =>
              navigate(`/pharmacy-owner/medicines/read/${row._id}`)
            }
          >
            View
          </button>
          <button
            className={`px-2 py-1 rounded ${
              row.deleted
                ? "bg-green-600 text-white"
                : "bg-red-500 text-white"
            }`}
            onClick={() => handleToggleDelete(row._id, row.deleted)}
          >
            {row.deleted ? "Restore" : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {loading ? (
        <PulseSpinner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Your Medicines</h1>
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

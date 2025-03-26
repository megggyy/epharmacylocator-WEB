import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";

const ExpiringMedicines = () => {
  const navigate = useNavigate();
  const [medicationsList, setMedicationsList] = useState([]);
  const [medicationsFilter, setMedicationsFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });

  const fetchMedications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}medicine/list`);
      setMedicationsList(response.data);
      setMedicationsFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medications:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const applyExpiryFilter = (filter) => {
    const today = new Date();
    const filtered = medicationsList.filter((med) =>
      med.expirationPerStock.some((exp) => {
        const expiryDate = new Date(exp.expirationDate);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (filter === "week") return daysLeft > 0 && daysLeft <= 7;
        if (filter === "month") return daysLeft > 0 && daysLeft <= 30;
        if (filter === "3months") return daysLeft > 0 && daysLeft <= 90;
        if (filter === "6months") return daysLeft > 0 && daysLeft <= 180;
        return true;
      })
    );
    setMedicationsFilter(filtered);
  };

  const handleExpiryFilterChange = (filter) => {
    setExpiryFilter(filter);
    setSelectedDates({ start: null, end: null });
    applyExpiryFilter(filter);
  };

  const filterByCustomDates = (start, end) => {
    if (!start || !end) return;
    const filtered = medicationsList.filter((med) =>
      med.expirationPerStock.some((exp) => {
        const expiryDate = new Date(exp.expirationDate);
        return expiryDate >= start && expiryDate <= end;
      })
    );
    setMedicationsFilter(filtered);
  };

  const columns = [
    { name: "Generic Name", selector: (row) => row.medicine.genericName, sortable: true },
    { name: "Brand Name", selector: (row) => row.medicine.brandName, sortable: true },
    { name: "Category", selector: (row) => row.medicine.category.map((cat) => cat.name).join(", "), sortable: true },
    { name: "Expiry Dates", selector: (row) => row.expirationPerStock.map((exp) => new Date(exp.expirationDate).toLocaleDateString()).join(", "), sortable: true },
  ];

  return (
    <div className="p-6">
      {loading ? (
        <PulseSpinner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Expiring Medicines</h1>
          </div>
          <div className="flex gap-4">
            {["all", "week", "month", "3months", "6months"].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded ${expiryFilter === filter ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                onClick={() => handleExpiryFilterChange(filter)}
              >
                {filter === "all" ? "All" : filter.replace(/(\d)(months?)/, "$1 $2")}
              </button>
            ))}
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDatePicker(true)}>📅 Custom Date</button>
          </div>

          {showDatePicker && (
            <div className="mt-4 p-4 bg-white border rounded">
              <h3 className="text-lg font-bold">Select Date Range</h3>
              <DateTimePicker
                value={selectedDates.start || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => setSelectedDates((prev) => ({ ...prev, start: date, end: null }))}
              />
              <DateTimePicker
                value={selectedDates.end || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (date >= selectedDates.start) {
                    setSelectedDates((prev) => ({ ...prev, end: date }));
                    filterByCustomDates(selectedDates.start, date);
                    setShowDatePicker(false);
                  }
                }}
              />
            </div>
          )}

          <DataTable
            title="Medicines"
            columns={columns}
            data={medicationsFilter}
            pagination
            highlightOnHover
          />
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default ExpiringMedicines;

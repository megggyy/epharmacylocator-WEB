import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import '../../../layouts/StyleCSS/readMedicine.css'



export default function ReadMedicationScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [medicationData, setMedicationData] = useState(null);
  const [category, setCategory] = useState("");
  const [isCategory, setIsCategory] = useState(true);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine/admin/read/${id}`);
        setMedicationData(response.data);
      } catch (error) {
        console.error("Error fetching medication:", error.response?.data || error.message);
        alert("Failed to load medication details");
      }
    };
    if (id) fetchMedication();
  }, [id]);

  useEffect(() => {
    if (Array.isArray(medicationData) && medicationData.length > 0) {
      const newCategory = Array.isArray(medicationData[0].medicine.category)
        ? medicationData[0].medicine.category.map((cat) => cat.name).join("/ ")
        : medicationData[0].medicine.category?.name || "No Category";
      setCategory(newCategory);
    }
  }, [medicationData]);

  const handleCategoryClick = () => {
    setIsCategory((prev) => !prev);
  };

  if (!medicationData) {
    return (
      <div className="loading-container">
        <PulseSpinner />
      </div>
    );
  }

  const medication = Array.isArray(medicationData) ? medicationData[0] : medicationData;
  const medicine = medication?.medicine;
  const pharmacy = medication?.pharmacy;

  if (!medicine) {
    return (
      <div className="loading-container">
        <p>No medication data found</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <button onClick={() => navigate('admin/medicine/allMedicines')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />
        </button>
        <h1>{medicine.brandName}</h1>
      </header>

      <div className="details-container">
        <p className="label">Generic Name:</p>
        <p className="value">{medicine.genericName || "N/A"}</p>

        <p className="label">Dosage Strength:</p>
        <p className="value">{medicine.dosageStrength || "N/A"}</p>

        <p className="label">Dosage Form:</p>
        <p className="value">{medicine.dosageForm || "N/A"}</p>

        <p className="label">Classification:</p>
        <p className="value">{medicine.classification || "N/A"}</p>

      <p className="label">Category:</p>
      <p className="value" onClick={handleCategoryClick}>
        {isCategory ? category || "No Category" : medicine?.description || "No Description"}
      </p>

      {/* ✅ Price Section */}
      <p className="label">Price:</p>
      <p className="value">
        {medication.price != null && medication.price !== ""
          ? `₱${parseFloat(medication.price).toFixed(2)}`
          : "Price not indicated"}
      </p>

      </div>

      <div className="pharmacy-container">
        <h2>LIST OF PHARMACIES</h2>
      </div>

    {Array.isArray(medicationData) && medicationData.length > 0 ? (
      medicationData.map((entry, idx) => (
        <div key={idx} className="info-container mt-4">
          <div className="details-container">
            <p className="label">Name:</p>
            <p className="value">{entry.pharmacy?.userInfo?.name || "N/A"}</p>

            <p className="label">Location:</p>
            <p className="value">
              {`${entry.pharmacy?.userInfo?.street}, ${entry.pharmacy?.userInfo?.barangay}, ${entry.pharmacy?.userInfo?.city}`}
            </p>

            <p className="label">Contact:</p>
            <p className="value">{entry.pharmacy?.userInfo?.contactNumber || "N/A"}</p>

            <p className="label">Availability:</p>
            <p className="value">
              {entry.pharmacy?.businessDays || "N/A"} from {entry.pharmacy?.openingHour || "N/A"} - {entry.pharmacy?.closingHour || "N/A"}
            </p>

            <p className="label">Price:</p>
            <p className="value">
              {entry.price != null && entry.price !== ""
                ? `₱${parseFloat(entry.price).toFixed(2)}`
                : "Price not indicated"}
            </p>

            <div className="expiration-stock">
              <p className="label">Expiration Date:</p>
              <p className="label">Stock:</p>
            </div>

            {entry.expirationPerStock?.length > 0 ? (
              entry.expirationPerStock.map((exp, index) => (
                <div key={index} className="expiration-stock">
                  <p className="value">
                    {exp?.expirationDate
                      ? new Date(exp.expirationDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No Expiration Date"}
                  </p>
                  <p className="value">{exp.stock}</p>
                </div>
              ))
            ) : (
              <p className="value">No Expiration Data</p>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="value">No Pharmacy Data</p>
    )}
    </div>
  );
}

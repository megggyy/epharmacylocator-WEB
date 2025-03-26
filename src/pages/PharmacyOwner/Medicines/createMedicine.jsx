import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthGlobal from "@/context/AuthGlobal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import { API_URL } from "../../../env";

const CreateMedicines = () => {
  const navigate = useNavigate();
  const [filteredGeneric, setFilteredGeneric] = useState([]);
  const [generics, setGenerics] = useState([]);
  const [searchGeneric, setSearchGeneric] = useState("");
  const [genericModalVisible, setGenericModalVisible] = useState(false);
  const [selectedGeneric, setSelectedGeneric] = useState("");

  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchMedicine, setSearchMedicine] = useState("");

  const [items, setItems] = useState([]);

  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState({});
  const [expirationDates, setExpirationDates] = useState({});
  const [stockInputs, setStockInputs] = useState({});
  const { state } = useContext(AuthGlobal);

  useEffect(() => {
    fetchGenericNames()
    setFilteredMedicines(medicines);
    setFilteredGeneric(generics);
  }, [medicines], [generics]);

  const fetchGenericNames = async () => {
    try {
      const response = await axios.get(`${API_URL}medicine/json`);

      const uniqueCompositionsMap = new Map();

      response.data.forEach(item => {
        const normalizedKey = item.genericName.replace(/\s+/g, '').toLowerCase();
        if (!uniqueCompositionsMap.has(normalizedKey)) {
          uniqueCompositionsMap.set(normalizedKey, item.genericName);
        }
      });

      setGenerics(Array.from(uniqueCompositionsMap.values()));
    } catch (error) {
      console.error("Error fetching generic names: ", error);
    }
  };

  const filterGeneric = (text) => {
    setSearchGeneric(text);
    const filtered = generics.filter((generic) =>
      generic.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredGeneric(filtered);
  };
  

  const openModal = () => {
    setGenericModalVisible(true);
    setFilteredGeneric(generics); // Make sure the full list shows
  };


  const handleGenericSelect = async (generic) => {
    setSelectedGeneric(generic);
    setGenericModalVisible(false);

    console.log('generic: ', generic)
    try {
      const response = await axios.get(`${API_URL}medicine/json`);

      // Normalize the selected generic name
      const normalizedGeneric = generic.trim().toLowerCase();

      // Filter medicines by generic name (ignoring spaces and case)
      const filteredMedicines = response.data.filter(item =>
        item.genericName?.trim().toLowerCase() === normalizedGeneric
      );

      // Extract relevant details
      const filteredMedicinesDetails = filteredMedicines.map(item => ({
        brandName: item.brandName?.trim() || '',
        dosageStrength: item.dosageStrength || '',
        dosageForm: item.dosageForm || '',
        classification: item.classification || '',
        category: item.category || '',
        description: item.description || '',
      })).filter(item => item.brandName); // Ensure no empty brand names

      // Fetch existing medicines and filter out those already in stock
      fetchExistingMedicines(generic, filteredMedicinesDetails);

    } catch (error) {
      console.error("Error fetching generic select:", error);
    }
  };

  // Fetch existing medicines from the pharmacy stock
  const fetchExistingMedicines = async (generic, genericMedicines) => {
    setSearchGeneric('');

    try {
      const response = await axios.get(`${API_URL}medicine/existing/${state.user.userId}/${generic}`);

      if (response.data) {
        const existingMedicines = response.data.map(item => item.medicine); // Extract medicines from stock

        const nonExistingMedicines = genericMedicines.filter(med =>
          !existingMedicines.some(existing =>
            existing.brandName === med.brandName &&
            existing.dosageStrength === med.dosageStrength &&
            existing.dosageForm === med.dosageForm &&
            existing.classification === med.classification
          )
        );


        setMedicines(nonExistingMedicines); // Update state with non-existing medicines
      }
    } catch (error) {
    }
  };


  const filterMedicines = (text) => {
    setSearchMedicine(text); // keep input synced
    const filtered = medicines.filter((medicine) =>
      medicine.brandName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMedicines(filtered);
  };
  

  const handleMedicineSelect = (index) => {
    setSelectedMedicineIndex(index);  // Set selected medicine index
  };

  const addNewItem = () => {
    if (selectedMedicineIndex === null) return; // Prevent adding if no medicine is selected

    const newIndex = items[selectedMedicineIndex] ? items[selectedMedicineIndex].length : 0;
    setItems((prev) => ({
      ...prev,
      [selectedMedicineIndex]: [...(prev[selectedMedicineIndex] || []), newIndex],
    }));
    setStockInputs((prev) => ({
      ...prev,
      [`${selectedMedicineIndex}-${newIndex}`]: '',
    }));
    setExpirationDates((prev) => ({
      ...prev,
      [`${selectedMedicineIndex}-${newIndex}`]: '',
    }));
  };



  const removeItem = (medicineIndex, subIndex) => {
    setItems((prev) => ({
      ...prev,
      [medicineIndex]: prev[medicineIndex].filter((i) => i !== subIndex),
    }));
    setStockInputs((prev) => {
      const updatedInputs = { ...prev };
      delete updatedInputs[`${medicineIndex}-${subIndex}`];
      return updatedInputs;
    });
    setExpirationDates((prev) => {
      const updatedDates = { ...prev };
      delete updatedDates[`${medicineIndex}-${subIndex}`];
      return updatedDates;
    });
  };

  const handleStockChange = (index, text) => {
    setStockInputs((prevState) => {
      const updatedState = { ...prevState, [index]: text };
      return updatedState;
    });
  };

  const handleExpirationChange = (index, event, selectedDate) => {
    setDatePickerVisible((prev) => ({
      ...prev,
      [index]: false, // Hide picker after selection
    }));

    if (selectedDate) {
      let isoDate = selectedDate.toISOString().split("T")[0]; // Format for saving (YYYY-MM-DD)

      let formattedDate = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(selectedDate); // Display as "February 21, 2025"

      setExpirationDates((prev) => ({
        ...prev,
        [index]: formattedDate, // Updates selected index
      }));
    }
  };

  const handleSubmit = async (index) => {

    if (!medicines || medicines.length === 0) {
      console.error("Medicines array is empty or undefined.");
      return;
    }

    const selectedMedicine = medicines[index];

    if (!selectedMedicine) {
      console.error(`No medicine found at index: ${index}`);
      return;
    }


    // Gather all stock and expiration date entries for the selected medicine
    const stockEntries = [];
    const expirationEntries = [];

    if (items[index] && items[index].length > 0) {
      items[index].forEach((subIndex) => {
        const stockKey = `${index}-${subIndex}`;
        const expirationKey = `${index}-${subIndex}`;

        const stockValue = parseInt(stockInputs[stockKey], 10) || 0;
        let rawDate = expirationDates[expirationKey] || '';

        // Convert displayed date back to ISO format
        let parsedDate = new Date(rawDate);
        let isoDate = !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : rawDate;

        if (stockValue && isoDate) {
          stockEntries.push({ stock: stockValue, expirationDate: isoDate });
        }
      });
    }

    if (stockEntries.length === 0) {
      toast.error('Please enter stock and expiration date.')
      return;
    }


    try {
      const response = await axios.post(`${API_URL}medicine/create`, {
        genericName: selectedGeneric,
        brandName: selectedMedicine.brandName,
        dosageStrength: selectedMedicine.dosageStrength,
        dosageForm: selectedMedicine.dosageForm,
        classification: selectedMedicine.classification,
        category: selectedMedicine.category,
        description: selectedMedicine.description,
        expirationPerStock: stockEntries, // Use the collected stock & expiration data
        pharmacy: state.user.userId,
      });


      // Remove the added medicine from the list
      setMedicines((prevMedicines) => prevMedicines.filter((_, i) => i !== index));

      // Clear stock input and expiration date for this index
      setStockInputs((prevStockInput) => {
        const newStockInput = { ...prevStockInput };
        items[index]?.forEach((subIndex) => delete newStockInput[`${index}-${subIndex}`]);
        return newStockInput;
      });

      setExpirationDates((prevExpirationDates) => {
        const newExpirationDates = { ...prevExpirationDates };
        items[index]?.forEach((subIndex) => delete newExpirationDates[`${index}-${subIndex}`]);
        return newExpirationDates;
      });

      setSelectedMedicineIndex(null);
      setSearchMedicine('')

      // Show success message
      toast.success('The medication has been added successfully.')

    } catch (error) {
      toast.error('Failed to add medication. Please try again.')
    }
  };

  return (

    <div className="container">
      <ToastContainer />
      <div className="header">
        <button
          className="back-btn"
          onClick={() => navigate('/pharmacy-owner/medicines')}
        >
          &larr; Back
        </button>
        <h1>Create Medicine</h1>
      </div>

      <main className="main-content">
        <button
          className="generic-btn"
          onClick={openModal}
        >
          {selectedGeneric || 'Select Generic Name'}
        </button>

        {genericModalVisible && (
          <div
            className="modal-overlay"
            onClick={() => setGenericModalVisible(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <input
                type="text"
                placeholder="Search Generic"
                value={searchGeneric}
                onChange={(e) => filterGeneric(e.target.value)}
                className="search-input"
              />
              <ul className="generic-list">
                {filteredGeneric.map((generic, index) => (
                  <li
                    key={index}
                    className="generic-item"
                    onClick={() => handleGenericSelect(generic)}
                  >
                    {generic}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}


        <input
          type="text"
          placeholder="Search Medicines"
          value={searchMedicine}
          onChange={(e) => filterMedicines(e.target.value)}
          className="search-input"
        />

        <div className="medicine-grid">
          {filteredMedicines.map((medicine, index) => (
            <div key={index} className="medicine-card">
              <p><strong>Brand Name:</strong> {medicine.brandName}</p>
              <p><strong>Dosage Strength:</strong> {medicine.dosageStrength}</p>
              <p><strong>Dosage Form:</strong> {medicine.dosageForm}</p>
              <p><strong>Classification:</strong> {medicine.classification}</p>
              <p><strong>Category:</strong> {medicine.description}</p>

              <button
                onClick={() => handleMedicineSelect(index)}
                className="add-stock-btn"
              >
                ADD STOCK
              </button>

              {selectedMedicineIndex === index && (
                <div className="stock-section">
                  {(items[index] || []).map((subIndex) => (
                    <div key={`${index}-${subIndex}`} className="stock-row">
                      <div className="input-group">
                        <label>Expiration Date</label>
                        <DatePicker
                          selected={expirationDates[`${index}-${subIndex}`] || null}
                          onChange={(date) => handleExpirationChange(`${index}-${subIndex}`, null, date)}
                          dateFormat="MMMM dd, yyyy"
                          placeholderText="Select Date"
                          className="input"
                        />
                      </div>
                      <div className="input-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          placeholder="Enter stock"
                          value={stockInputs[`${index}-${subIndex}`] || ""}
                          onChange={(e) => handleStockChange(`${index}-${subIndex}`, e.target.value)}
                          className="input"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(index, subIndex)}
                        className="delete-btn"
                      >
                        ❌
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addNewItem}
                    className="add-item-btn"
                  >
                    +
                  </button>
                </div>
              )}

              <div className="final-add-container">
                <button
                  onClick={() => handleSubmit(index)}
                  className="final-add-btn"
                  disabled={
                    !(items[index] || []).some(
                      (subIndex) => stockInputs[`${index}-${subIndex}`] > 0
                    )
                  }
                >
                  ADD
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


export default CreateMedicines;

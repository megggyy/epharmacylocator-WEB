import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";

const ITEMS_PER_PAGE = 10;

const LicensedPharmaciesScreen = () => {
  const navigate = useNavigate();
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [pharmaciesFilter, setPharmaciesFilter] = useState([]);
  const [barangaysList, setBarangaysList] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

    useEffect(() => {
    const fetchData = async () => {
        try {
        const [pharmacyRes, barangayRes] = await Promise.all([
            axios.get(`${API_URL}pharmacies/json`),
            axios.get(`${API_URL}barangays`),
        ]);
        setPharmaciesList(pharmacyRes.data);
        setPharmaciesFilter(pharmacyRes.data);
        setBarangaysList(barangayRes.data);
        setLoading(false);
        } catch (error) {
        console.error("Error fetching pharmacies/barangays:", error);
        }
    };

    fetchData();

    return () => {
        setPharmaciesList([]);
        setPharmaciesFilter([]);
        setBarangaysList([]);
        setLoading(true);
    };
    }, []);

  const searchCategories = (text, barangayFilter = selectedFilter) => {
    setSearchText(text);
    let filtered = pharmaciesList.filter((i) =>
      ["licenseNumber", "pharmacyName", "address"].some((key) =>
        i[key]?.toLowerCase().includes(text.toLowerCase())
      )
    );
    if (barangayFilter) {
      filtered = filtered.filter((i) =>
        i.address?.toLowerCase().includes(barangayFilter.toLowerCase())
      );
    }
    setPharmaciesFilter(filtered);
  };

  const openModal = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setModalVisible(true);
  };

  const columns = [
    { name: "Licensed Number", selector: (row) => row.licenseNumber, sortable: true },
    { name: "Name", selector: (row) => row.pharmacyName, sortable: true },
    { name: "Owner", selector: (row) => row.owner, sortable: true },
    { name: "Address", selector: (row) => row.address, sortable: true },
    { name: "Issuance Date", selector: (row) => row.issuanceDate, sortable: true },
    { name: "Expiry Date", selector: (row) => row.expiryDate, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <button onClick={() => openModal(row)} className="text-blue-600 hover:text-blue-800">View</button>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: { backgroundColor: "#0B607E", color: "white" },
    },
    rows: {
      style: { backgroundColor: "#F5F5F5" },
      highlightOnHoverStyle: {
        backgroundColor: "#E6F7FF",
        transition: "all 0.3s ease",
      },
    },
  };

  return (
    <div className="p-6">
      {loading ? (
        <PulseSpinner />
      ) : (
        <>
          <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
            <h1 className="text-2xl font-bold">Licensed Pharmacies</h1>
          </div>

          {/* Search Input */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search Licensed Number, Pharmacy Name, Address"
              className="border rounded-md p-2 w-full mb-4"
              value={searchText}
              onChange={(e) => searchCategories(e.target.value)}
            />
          </div>

          {/* Barangay Filter Buttons */}
          <div className="flex space-x-2 overflow-x-auto mb-4">
            {barangaysList
              .filter((barangay) =>
                pharmaciesList.some((pharmacy) =>
                  pharmacy.address?.toLowerCase().includes(barangay.name.toLowerCase())
                )
              )
              .map((barangay) => (
                <button
                  key={barangay.id}
                  className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                    selectedFilter === barangay.name
                      ? "bg-gray-300 text-black"
                      : "bg-[#0B607E] text-white"
                  }`}
                  onClick={() => {
                    const newFilter = selectedFilter === barangay.name ? null : barangay.name;
                    setSelectedFilter(newFilter);
                    searchCategories(searchText, newFilter);
                  }}
                >
                  {barangay.name}
                </button>
              ))}
          </div>

          <DataTable
            columns={columns}
            data={pharmaciesFilter}
            customStyles={customStyles}
            pagination
            highlightOnHover
          />
        </>
      )}

      {/* Modal for pharmacy details */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Pharmacy Details</h2>
            {selectedPharmacy && (
              <div>
                <p><strong>License Number:</strong> {selectedPharmacy.licenseNumber}</p>
                <p><strong>Name:</strong> {selectedPharmacy.pharmacyName}</p>
                <p><strong>Owner:</strong> {selectedPharmacy.owner}</p>
                <p><strong>Address:</strong> {selectedPharmacy.address}</p>
                <p><strong>Issuance Date:</strong> {selectedPharmacy.issuanceDate}</p>
                <p><strong>Expiry Date:</strong> {selectedPharmacy.expiryDate}</p>
              </div>
            )}
            <button
              onClick={() => setModalVisible(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicensedPharmaciesScreen;

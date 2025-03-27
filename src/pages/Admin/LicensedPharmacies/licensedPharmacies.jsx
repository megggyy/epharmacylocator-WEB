import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";

const LicensedPharmaciesScreen = () => {
    const navigate = useNavigate();
    const [pharmaciesList, setPharmaciesList] = useState([]);
    const [pharmaciesFilter, setPharmaciesFilter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}pharmacies/json`);
                setPharmaciesList(response.data);
                setPharmaciesFilter(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching pharmacies:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const searchPharmacies = (text) => {
        if (text === "") {
            setPharmaciesFilter(pharmaciesList);
          } else {
            setPharmaciesFilter(
              pharmaciesList.filter((i) =>
                ["licenseNumber", "pharmacyName", "address"] // Add the fields you want to search in
                  .some((key) => i[key]?.toLowerCase().includes(text.toLowerCase()))
              )
            );
          }
    };

    const openModal = (pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setModalVisible(true);
    };

    const columns = [
        {
            name: "Licensed Number",
            selector: (row) => row.licenseNumber,
            sortable: true,
        },
        {
            name: "Name",
            selector: (row) => row.pharmacyName,
            sortable: true,
        },
        {
            name: "Owner",
            selector: (row) => row.owner,
            sortable: true,
        },
        {
            name: "Address",
            selector: (row) => row.address,
            sortable: true,
        },
        {
            name: "Issuance Date",
            selector: (row) => row.issuanceDate,
            sortable: true,
        },
        {
            name: "Expiry Date",
            selector: (row) => row.expiryDate,
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <button onClick={() => openModal(row)} className="text-blue-600 hover:text-blue-800">View</button>
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
        <div className="p-6">
            {loading ? (
                <PulseSpinner /> // Keeping your spinner component
            ) : (
                <>
                    <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Licensed Pharmacies</h1>
                        </div>
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


                    <DataTable
                        columns={columns}
                        data={pharmaciesFilter}
                        customStyles={customStyles}
                        pagination
                        highlightOnHover
                    />
                </>
            )}

            {modalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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

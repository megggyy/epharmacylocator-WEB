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
                pharmaciesList.filter((pharmacy) =>
                    pharmacy.pharmacyName.toLowerCase().includes(text.toLowerCase())
                )
            );
        }
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
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">Licensed Pharmacies</h1>
                        </div>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search"
                                onChange={(e) => searchPharmacies(e.target.value)}
                                className="border rounded px-3 py-2 w-96"
                            />
                        </div>
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
        </div>


    );

};

export default LicensedPharmaciesScreen;

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsersBetweenLines,
  faTags,
  faPills,
  faHospital,
  faBarcode,
  faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_URL } from "../../../env";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    pharmacies: 0,
    categories: 0,
    medicines: 0,
    // scannedMedicines: 0,
    pendingPharmacies: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, pharmaciesRes, categoriesRes, medicinesRes] = await Promise.all([
          axios.get(`${API_URL}users`),
          axios.get(`${API_URL}pharmacies`),
          axios.get(`${API_URL}medication-category`),
          axios.get(`${API_URL}medicine`),
        ]);
  
        // Debugging the pharmacies data
        console.log("Pharmacies Data:", pharmaciesRes.data);
  
        // Safely filter pending pharmacies
        const pendingPharmacies = pharmaciesRes.data.filter((pharmacy) => {
          return pharmacy?.approved === false;
        });
  
        console.log("Pending Pharmacies:", pendingPharmacies);
  
        const uniqueMedicines = [...new Set(medicinesRes.data.map((med) => med.name))];
  
        setCounts({
          users: usersRes.data.length,
          pharmacies: pharmaciesRes.data.length,
          categories: categoriesRes.data.length,
          medicines: uniqueMedicines.length,
          pendingPharmacies: pendingPharmacies.length, // Count of pending pharmacies
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  
  
  return (
    <div className="bg-primary-t4 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col text-center mt-4">
        <h1 className="text-2xl xl:text-3xl text-primary-default font-extrabold">
          ADMIN DASHBOARD
        </h1>
      </div>

      {/* Total Analytics */}
      <div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {/* Total Users */}
          <div
            className="stat bg-primary-default text-primary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faUsersBetweenLines} size="2x" />
            <div className="stat-title mt-2">Total Users</div>
            <div className="stat-value text-lg">{counts.users}</div>
          </div>

          {/* Total Pharmacies */}
          <div
            className="stat bg-primary-variant text-primary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faHospital} size="2x" />
            <div className="stat-title mt-2">Total Pharmacies</div>
            <div className="stat-value text-lg">{counts.pharmacies}</div>
          </div>

          {/* Total Medicines */}
          <div
            className="stat bg-primary-accent text-primary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faPills} size="2x" />
            <div className="stat-title mt-2">Total Medicines</div>
            <div className="stat-value text-lg">{counts.medicines}</div>
          </div>

          {/* Total Categories */}
          <div
            className="stat bg-secondary-default text-secondary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faTags} size="2x" />
            <div className="stat-title mt-2">Total Categories</div>
            <div className="stat-value text-lg">{counts.categories}</div>
          </div>

          {/* Scanned Medicines */}
          <div
            className="stat bg-secondary-variant text-secondary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faBarcode} size="2x" />
            <div className="stat-title mt-2">Scanned Medicines</div>
            <div className="stat-value text-lg">--</div>
          </div>

          {/* Pending Pharmacies */}
          <div
            className="stat bg-secondary-accent text-secondary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faClipboardCheck} size="2x" />
            <div className="stat-title mt-2">Pending Pharmacies</div>
            <div className="stat-value text-lg">{counts.pendingPharmacies}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

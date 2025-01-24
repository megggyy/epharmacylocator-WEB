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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    pharmacies: 0,
    categories: 0,
    medicines: 0,
    // scannedMedicines: 0,
    pendingPharmacies: 0
  });

  const [customersData, setCustomersData] = useState([]);
  const [scannedData, setScannedData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, pharmaciesRes, categoriesRes, medicinesRes] = await Promise.all([
          axios.get(`${API_URL}users`),
          axios.get(`${API_URL}pharmacies`),
          axios.get(`${API_URL}medication-category`),
          axios.get(`${API_URL}medicine`),
        ]);

        const pendingPharmacies = pharmaciesRes.data.filter((pharmacy) => pharmacy?.approved === false);

        const uniqueMedicines = [...new Set(medicinesRes.data.map((med) => med.name))];

        setCounts({
          users: usersRes.data.length,
          pharmacies: pharmaciesRes.data.length,
          categories: categoriesRes.data.length,
          medicines: uniqueMedicines.length,
          pendingPharmacies: pendingPharmacies.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchCustomersData = async () => {
      try {
        const response = await axios.get(`${API_URL}users/customersPerMonth`);
        const result = response.data;
    
        if (result.success) {
          const data = result.getUsersPerMonth.map((item) => ({
            month: item.month,
            total: item.total,
            year: item.year,
            monthIndex: new Date(`${item.month} 1`).getMonth(), // Convert month name to index
          }));
    
          // Sort by year and then by month index
          const sortedData = data.sort(
            (a, b) => a.year - b.year || a.monthIndex - b.monthIndex
          );
    
          // Remove unnecessary fields for final state
          setCustomersData(
            sortedData.map(({ month, total }) => ({ month, total }))
          );
        }
      } catch (error) {
        console.error("Error fetching customers data:", error);
      }
    };
    
    
    
    fetchData();
    fetchCustomersData();

    // Simulated most scanned prescriptions data
    setScannedData([
      { name: "Paracetamol", total: 120 },
      { name: "Ibuprofen", total: 95 },
      { name: "Amoxicillin", total: 80 },
      { name: "Cetirizine", total: 75 },
      { name: "Loratadine", total: 60 },
    ]);
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
        {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6 p-6">
       {/* Line Chart for Monthly New Customers */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly New Customers</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      
              {/* Line Chart */}
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Most Scanned Prescriptions</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scannedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
    </div>
    
  );
};

export default Dashboard;

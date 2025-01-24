import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../env";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    pharmacies: 0,
    categories: 0,
    medicines: 0,
    pendingPharmacies: 0,
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
          }));
          setCustomersData(data);
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
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-700">ADMIN DASHBOARD</h1>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-blue-500 text-white rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Pharmacies</h2>
          <p className="text-2xl font-bold">{counts.pharmacies}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-2xl font-bold">{counts.users}</p>
        </div>
        <div className="bg-orange-500 text-white rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-2xl font-bold">{counts.categories}</p>
        </div>
        <div className="bg-purple-500 text-white rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Medicines</h2>
          <p className="text-2xl font-bold">{counts.medicines}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly New Customers</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
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

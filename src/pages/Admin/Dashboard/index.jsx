import React, { useEffect, useState } from "react";
import ReactModal from 'react-modal';
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

ReactModal.setAppElement('#root');

const Dashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    pharmacies: 0,
    categories: 0,
    medicines: 0,
    scannedPrescriptions: 0,
    pendingPharmacies: 0
  });

  const [customersData, setCustomersData] = useState([]);
  const [scannedData, setScannedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const [usersRes, pharmaciesRes, categoriesRes, medicinesRes, prescriptionRes] = await Promise.all([
            axios.get(`${API_URL}users`),
            axios.get(`${API_URL}pharmacies`),
            axios.get(`${API_URL}medication-category`),
            axios.get(`${API_URL}medicine`),
            axios.get(`${API_URL}prescriptions`) 
          ]);
  
          const pendingPharmacies = pharmaciesRes.data.filter((pharmacy) => pharmacy?.approved === false);
  
          const uniqueMedicines = [...new Set(medicinesRes.data.map((med) => med.name))];
          const scannedPrescriptions = prescriptionRes.data?.totalPrescriptions || 0;
          setCounts({
            users: usersRes.data.length,
            pharmacies: pharmaciesRes.data.length,
            categories: categoriesRes.data.length,
            medicines: uniqueMedicines.length,
            pendingPharmacies: pendingPharmacies.length,
            scannedPrescriptions
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
    
    const fetchScannedMedicines = async () => {
    try {
      const response = await axios.get(`${API_URL}customers/mostScannedMedicines`);
      const result = response?.data;

      if (result?.success) {
        const topMedicines = result?.mostScannedMedicines
          .map((item) => ({
            name: item._id,
            total: item.count
          }))
          .sort((a, b) => b.total - a.total) // descending
          .slice(0, 5); // top 5 only

        setScannedData(topMedicines);
      }
    } catch (error) {
      console.error("Error fetching most scanned medicines:", error);
    }
  };

    fetchScannedMedicines();  
    fetchData();
    fetchCustomersData();


  }, []);
  
  const topScanned = [...scannedData]
  .sort((a, b) => b.total - a.total)
  .slice(0, 5);


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
            <div className="stat-value text-lg">{counts.scannedPrescriptions}</div>
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
          <div className="bg-white p-4 rounded shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Most Scanned Medicines</h2>
          <div onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scannedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
           <XAxis 
              dataKey="name" 
              tickFormatter={(name) =>
                name.length > 10 ? name.substring(0, 10) + "..." : name
              }
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", color: "gray", marginTop: 5 }}>Click chart to view top 5 medicines</p>
          </div>
          </div>
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Top Scanned Medicines"
          style={{
            content: {
              maxWidth: '400px',
              maxHeight: '350px',
              margin: 'auto',
              padding: '20px',
              borderRadius: '8px',
              overflowY: 'auto',
              textAlign: 'center',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
          }}
        >
          <h2 className="text-xl font-bold mb-4">Top 5 Scanned Medicines</h2>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {topScanned.map((item, index) => (
              <li key={index} className="mb-2 text-base">
                {index + 1}. <strong>{item.name}</strong> ({item.total} times)
              </li>
            ))}
          </ul>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#82ca9d',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            Close
          </button>
        </ReactModal>

            </div>
    </div>
    
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import axios from "axios";
import { API_URL } from "../../../env";
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');

const SummaryOfReports = () => {
  const [customersData, setCustomersData] = useState([]);
  const [scannedData, setScannedData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartData2, setChartData2] = useState([]);
  const [chartData3, setChartData3] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomersData = async () => {
      try {
        const response = await axios.get(`${API_URL}users/customersPerMonth`);
        const result = response.data;

        if (result.success) {
          const data = result.getUsersPerMonth.map((item) => {
            const monthName = item.month;
            const monthIndex = new Date(`${monthName} 1`).getMonth(); // Convert month name to index
            return {
              month: item.month,
              total: item.total,
              monthIndex,
            };
          });

          // Sort by monthIndex
          const sortedData = data.sort((a, b) => a.monthIndex - b.monthIndex);

          // Remove extra fields for final state
          setCustomersData(
            sortedData.map(({ month, total }) => ({ month, total }))
          );
        }
      } catch (error) {
        console.error("Error fetching customers data:", error);
      }
    };

    fetchCustomersData();

    const fetchMedicinesData = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine/medicinesPerCategory`);
        const result = response.data;

        if (result.success) {
          const formattedData = result.data.map((item) => ({
            name: item.name || "Unknown",
            value: item.count,
            color: getRandomColor(),
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching medicines data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPharmaciesData = async () => {
        try {
          const response = await axios.get(`${API_URL}pharmacies/pharmaciesPerBarangay`);
          const result = response.data;
  
          if (result.success) {
            const formattedData = result.data.map((item, index) => ({
              name: item.barangay || "Unknown",
              population: item.count,
              color: getRandomColor2(index),
            }));
            setChartData2(formattedData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      const fetchData = async () => {
        try {
          const response = await axios.get(`${API_URL}users/pharmaciesPerMonth`);
          const { getUsersPerMonth } = response.data;
  
          // Map the response data to chart-friendly format
          const formattedData = getUsersPerMonth.map((item) => ({
            month: item.month, // X-axis
            total: item.total, // Y-axis
          }));
  
          setChartData3(formattedData);
        } catch (error) {
          console.error("Error fetching pharmacy registrations:", error);
        } finally {
          setIsLoading(false);
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
    fetchData();
    fetchPharmaciesData();
    fetchMedicinesData();
    fetchScannedMedicines();  
  }, []);

    const topScanned = [...scannedData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Generates a random color in hexadecimal format
  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
  };

  const getRandomColor2 = (index) => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="bg-primary-t4 min-h-screen flex flex-col p-6">
      <h1 className="text-2xl xl:text-3xl text-primary-default font-extrabold text-center mb-6">
        Summary of Reports
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Monthly New Customers */}
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

        {/* Chart 2: Most Scanned Prescriptions */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            Most Scanned Prescriptions
          </h2>
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

        {/* Chart 3: Medicine Categories Pie Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Medicine Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : (
              <PieChart width={300} height={300}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Placeholder for Additional Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Pharmacies Per Barangay</h2>
          <ResponsiveContainer width="100%" height={300}>
                <BarChart
                      width={800} // Increased width
                      height={500} // Increased height
                      data={chartData2}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 50, // Increased bottom margin to prevent label cutoff
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-30} // This rotates the barangay names to vertical
                        textAnchor="end"
                        height={100} // Adjust the height to ensure labels are fully visible
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="population" fill="#8884d8">
                        {chartData2.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5: Placeholder for Additional Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly Pharmacy Registration</h2>
          <ResponsiveContainer width="100%" height={300}>
          <LineChart
                  width={1000}
                  height={500}
                  data={chartData3}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#0B607E"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SummaryOfReports;

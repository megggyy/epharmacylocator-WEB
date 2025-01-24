import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { API_URL } from "../../../env";
import logo from "@assets/epharmacy-logo.png";

const PharmacyBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPharmaciesData = async () => {
      try {
        const response = await axios.get(`${API_URL}pharmacies/pharmaciesPerBarangay`);
        const result = response.data;

        if (result.success) {
          const formattedData = result.data.map((item, index) => ({
            name: item.barangay || "Unknown",
            population: item.count,
            color: getRandomColor(index),
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPharmaciesData();
  }, []);

  const getRandomColor = (index) => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      {/* Header */}
      <div className="w-full bg-teal-700 text-white flex items-center justify-center p-4 mb-6">
        <img src={logo} alt="ePharmacy Logo" className="h-10 w-10 mr-3" />
        <h1 className="text-2xl font-bold">Number of Pharmacies per Barangay</h1>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-md shadow-lg w-full md:w-4/5 lg:w-3/4 xl:w-2/3 flex justify-center">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <BarChart
            width={800} // Increased width
            height={500} // Increased height
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80, // Increased bottom margin to prevent label cutoff
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45} // This rotates the barangay names to vertical
              textAnchor="end"
              height={120} // Adjust the height to ensure labels are fully visible
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="population" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
    </div>
  );
};

export default PharmacyBarChart;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { API_URL } from "../../../env";
import logo from "@assets/epharmacy-logo.png";

const MedicinePieChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        console.error("Error fetching medicines per category data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicinesData();
  }, []);

  // Generates a random color in hexadecimal format
  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      {/* Header */}
      <div className="w-full bg-teal-700 text-white flex items-center justify-center p-4 mb-6">
        <img src={logo} alt="ePharmacy Logo" className="h-10 w-10 mr-3" />
        <h1 className="text-2xl font-bold">Number of Medicines per Category</h1>
      </div>

      {/* Pie Chart Container */}
      <div className="bg-white p-8 rounded-md shadow-lg w-full md:w-3/4 lg:w-1/2 flex justify-center">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <PieChart width={400} height={400}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
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
      </div>
    </div>
  );
};

export default MedicinePieChart;

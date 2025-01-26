import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { API_URL } from "../../../env";
import logo from "@assets/epharmacy-logo.png";

const MonthlyPharmacyRegistrationChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}users/pharmaciesPerMonth`);
        const { getUsersPerMonth } = response.data;

        // Map the response data to chart-friendly format
        const formattedData = getUsersPerMonth.map((item) => ({
          month: item.month, // X-axis 
          year: item.year,
          total: item.total, // Y-axis
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching pharmacy registrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      {/* Header */}
      <div className="w-full bg-teal-700 text-white flex items-center justify-center p-4 mb-6">
                  <img src={logo} alt="ePharmacy Logo" className="h-10 w-10 mr-3" />
                  <h1 className="text-2xl font-bold">Monthly Pharmacy Registrations</h1>
          </div>

      {/* Chart Container */}
      <div className="flex items-center justify-center bg-white p-8 rounded-md shadow-lg w-full max-w-5xl">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-red-500">No data available.</div>
        ) : (
          <LineChart
            width={1000}
            height={500}
            data={chartData}
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
        )}
      </div>
    </div>
  );
};

export default MonthlyPharmacyRegistrationChart;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // <- Use default import!
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../../env';
import AuthGlobal from '@/context/AuthGlobal';

const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
  "#FF9F40", "#8A2BE2", "#32CD32", "#DC143C", "#FFD700"
];

export default function PharmacyOwnerDashboard() {
  const [totalMedications, setTotalMedications] = useState(0);
  const [medicationData, setMedicationData] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const { state } = useContext(AuthGlobal);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    axios.get(`${API_URL}users/${state.user.userId}`)
      .then(res => setUserProfile(res.data))
      .catch(err => console.error("Error fetching user profile:", err));

    if (state.user.role === "PharmacyOwner") {
      axios.get(`${API_URL}medicine/${state.user.userId}`)
        .then(res => setTotalMedications(res.data.length))
        .catch(err => console.error("Error fetching medications:", err));

      axios.get(`${API_URL}pharmacies/user/${state.user.userId}`)
        .then(res => {
          const pharmacyId = res.data?.id;
          if (!pharmacyId) return;

          axios.get(`${API_URL}pharmacies/medications-per-category/${pharmacyId}`)
            .then(medRes => {
              const raw = medRes.data;
              const data = Object.keys(raw).map((key, i) => ({
                name: key,
                value: raw[key],
                color: COLORS[i % COLORS.length],
              }));
              setMedicationData(data);
            })
            .catch(err => console.error("Error fetching medication categories:", err));
        })
        .catch(err => console.error("Error fetching pharmacy details:", err));
    }
  }, [state]);

const exportToPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Medication Summary Report", 14, 22);

  // Total Medications
  doc.setFontSize(12);
  doc.text(`Total Medications: ${totalMedications}`, 14, 32);

  // Table
  autoTable(doc, {
    startY: 40, // Move the table down to avoid overlapping the text
    head: [['Category', 'Count']],
    body: medicationData.map(item => [item.name, item.value]),
  });

  doc.save('Medication_Summary_Report.pdf');
};


  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(medicationData.map(item => ({
      Category: item.name,
      Count: item.value
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Medications");
    XLSX.writeFile(wb, "Medications.xlsx");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-default">Welcome, {userProfile?.name || 'Loading...'}!</h1>
        <span className="text-sm text-gray-600">Pharmacy Owner</span>
      </div>

      {/* Total Medications */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 text-center">
        <h2 className="text-gray-600">Total Medications</h2>
        <p className="text-4xl font-bold text-primary-variant">{totalMedications}</p>
      </div>

      {/* Chart */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Medications per Category</h3>
      <div className="bg-white rounded-lg shadow p-6">
        {medicationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={medicationData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {medicationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">No Data Available</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
        <button onClick={exportToPDF} className="bg-blue-700 text-white py-2 px-6 rounded-lg hover:bg-blue-800">
          Export to PDF
        </button>
        <button onClick={exportToExcel} className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700">
          Export to Excel
        </button>
        <button
          onClick={() => navigate('/pharmacy-owner/medicines')}
          className="bg-primary-variant text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Manage Medications
        </button>
      </div>
    </div>
  );
}

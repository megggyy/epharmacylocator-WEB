import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AuthGlobal from "../../../context/AuthGlobal";
import { API_URL } from "../../../env";
import DataTable from "react-data-table-component";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PulseSpinner from "../../../assets/common/spinner";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from "html2canvas";
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Tooltip,  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer } from 'recharts';


export default function PharmacyReports() {
  const { state: authState } = useContext(AuthGlobal);
  const user = authState.user;
  const [pharmacy, setPharmacy] = useState(null);
  const [pharmacyId, setPharmacyId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Expiring Medicines States
  const [medicationsList, setMedicationsList] = useState([]);
  const [medicationsFilter, setMedicationsFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });

  // overview tab
  const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
  "#FF9F40", "#8A2BE2", "#32CD32", "#DC143C", "#FFD700"
  ];

  const [totalMedications, setTotalMedications] = useState(0);
  const [medicationData, setMedicationData] = useState([]);

  // charts tab
  const [chartData1, setChartData1] = useState(null); // Customer Reviews
  const [chartData2, setChartData2] = useState(null); // Expiring Medicines
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

const address = pharmacy
  ? `${pharmacy.street || ''}${pharmacy.street ? ', ' : ''}${pharmacy.barangay || ''}${pharmacy.barangay ? ', ' : ''}${pharmacy.city || 'N/A'}`
  : '';

  // Fetch Pharmacy Details
  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("User not logged in");

        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        const userRes = await axios.get(`${API_URL}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPharmacy(userRes.data);

        const pharmacyRes = await axios.get(`${API_URL}pharmacies/user/${userId}`);
if (pharmacyRes.data && pharmacyRes.data.id) {
  setPharmacyId(pharmacyRes.data.id);

  // Fetch total medications
  axios.get(`${API_URL}medicine/${userId}`)
    .then(res => setTotalMedications(res.data.length))
    .catch(err => console.error("Error fetching medications:", err));

  // Fetch medications per category
  axios.get(`${API_URL}pharmacies/medications-per-category/${pharmacyRes.data.id}`)
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
}

      } catch (err) {
        console.error("Failed to fetch pharmacy details:", err);
      }
    };

    if (user && user.role === "PharmacyOwner") {
      fetchPharmacyDetails();
    }
  }, [user]);

useEffect(() => {
    if (authState.isAuthenticated) {
        if (authState.user.role !== "PharmacyOwner") return;

        axios.get(`${API_URL}pharmacies/user/${authState.user.userId}`)
            .then((res) => {
                if (res.data && typeof res.data === "object" && res.data.id) {
                    const pharmacyId = res.data.id;
                    setPharmacyId(pharmacyId);
                    fetchReviewStats(pharmacyId);
                    fetchExpiringStock(pharmacyId);
                } else {
                    console.error("No pharmacy found for this user.");
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching pharmacy details:", err);
                setLoading(false);
            });
    } else {
        router.push('/login');
    }
}, [authState.isAuthenticated, authState.user.userId, authState.user.role]);


  // Fetch Medications
  const fetchMedications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}medicine/${user.userId}`);
      setMedicationsList(response.data);
      setMedicationsFilter(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medications:", error);
      setLoading(false);
    }
  }, [user.userId]);

  const fetchReviewStats = async (pharmacyId) => {
  try {
    const res = await axios.get(`${API_URL}feedbacks/chart/${pharmacyId}`);
    const ratings = res.data;

    const formattedData = [
      { star: "1★", value: ratings[1] || 0 },
      { star: "2★", value: ratings[2] || 0 },
      { star: "3★", value: ratings[3] || 0 },
      { star: "4★", value: ratings[4] || 0 },
      { star: "5★", value: ratings[5] || 0 },
    ];
    setChartData1(formattedData);
  } catch (error) {
    console.error("Error fetching review stats:", error);
  }
};

const fetchExpiringStock = async (pharmacyId) => {
  try {
    const res = await axios.get(`${API_URL}pharmacies/expiringStock/${pharmacyId}`);
    const { expiringInWeek, expiringInMonth, expiringIn3Months, expiringIn6Months } = res.data;

    const formattedData = [
      { label: "1 Week", value: expiringInWeek },
      { label: "1 Month", value: expiringInMonth },
      { label: "3 Months", value: expiringIn3Months },
      { label: "6 Months", value: expiringIn6Months },
    ];
    setChartData2(formattedData);
  } catch (error) {
    console.error("Error fetching expiring stock data:", error);
  }
};

  useEffect(() => {
    if (activeTab === "expiring") {
      fetchMedications();
    }
  }, [activeTab, fetchMedications]);

  const searchMedications = (text) => {
    if (text === "") {
      setMedicationsFilter(medicationsList);
    } else {
      setMedicationsFilter(
        medicationsList.filter((i) =>
          [i.medicine?.genericName, i.medicine?.brandName].some((field) =>
            field?.toLowerCase().includes(text.toLowerCase())
          )
        )
      );
    }
  };

  const applyExpiryFilter = (filter) => {
    const today = new Date();
    const filtered = medicationsList.filter((med) =>
      med.expirationPerStock.some((exp) => {
        const expiryDate = new Date(exp.expirationDate);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (filter === "week") return daysLeft > 0 && daysLeft <= 7;
        if (filter === "month") return daysLeft > 0 && daysLeft <= 30;
        if (filter === "3months") return daysLeft > 0 && daysLeft <= 90;
        if (filter === "6months") return daysLeft > 0 && daysLeft <= 180;
        return true;
      })
    );
    setMedicationsFilter(filtered);
  };

  const handleExpiryFilterChange = (filter) => {
    setExpiryFilter(filter);
    setSelectedDates({ start: null, end: null });
    applyExpiryFilter(filter);
  };

  const filterByCustomDates = (start, end) => {
    if (!start || !end) return;
    const filtered = medicationsList.filter((med) =>
      med.expirationPerStock.some((exp) => {
        const expiryDate = new Date(exp.expirationDate);
        return expiryDate >= start && expiryDate <= end;
      })
    );
    setMedicationsFilter(filtered);
  };

  // === PDF Export Function ===
  const handleExportPDF = async () => {
    if (!pharmacy) return;

    const doc = new jsPDF();

    let y = 10;
    doc.setFontSize(16);
    doc.text(`Pharmacy Report - ${pharmacy.name}`, 10, y);
    y += 10;

    // Pharmacy Details
    doc.setFontSize(12);
    doc.text("Pharmacy Details:", 10, y);
    y += 8;
    doc.text(`Name: ${pharmacy.name}`, 10, y);
    y += 7;
    doc.text(`Address: ${address}`, 10, y);
    y += 7;
    doc.text(`Contact: ${pharmacy.contactNumber || "N/A"}`, 10, y);
    y += 10;

    // Overview Tab Section
    doc.setFontSize(14);
    doc.text("Overview", 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Total Medications: ${totalMedications}`, 10, y);
    y += 8;

    // Medications per Category Table
    if (medicationData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Category", "Number of Medications"]],
        body: medicationData.map(({ name, value }) => [name, value]),
        theme: "grid",
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Expiring Medicines Tab Section
    doc.setFontSize(14);
    doc.text("Expiring Medicines", 10, y);
    y += 8;

    if (medicationsFilter.length === 0) {
      doc.setFontSize(12);
      doc.text("No expiring medicines found for selected filter.", 10, y);
      y += 10;
    } else {
      // Table of Expiring Medicines
      const expTableBody = medicationsFilter.map((med) => [
        med.medicine.genericName || "N/A",
        med.medicine.brandName || "N/A",
        med.medicine.category.map((c) => c.name).join(", "),
        med.expirationPerStock.map((exp) => new Date(exp.expirationDate).toLocaleDateString()).join(", "),
      ]);
      autoTable(doc, {
        startY: y,
        head: [["Generic Name", "Brand Name", "Category", "Expiry Dates"]],
        body: expTableBody,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Charts Data Tables
  doc.setFontSize(14);
  doc.text("Charts Data", 10, y);
  y += 8;

  if (chartData1 && chartData1.length > 0) {
    doc.setFontSize(12);
    doc.text("Customer Reviews (Stars)", 10, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Star Rating", "Number of Reviews"]],
      body: chartData1.map(({ star, value }) => [star, value]),
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (chartRef1.current) {
    const canvas = await html2canvas(chartRef1.current);
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (y + imgHeight > 280) {
      doc.addPage();
      y = 10;
    }

    doc.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
    y += imgHeight + 10;
  }

  if (chartData2 && chartData2.length > 0) {
    doc.setFontSize(12);
    doc.text("Expiring Medicines (Timeframes)", 10, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Timeframe", "Count"]],
      body: chartData2.map(({ label, value }) => [label, value]),
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (chartRef2.current) {
    const canvas = await html2canvas(chartRef2.current);
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (y + imgHeight > 280) {
      doc.addPage();
      y = 10;
    }

    doc.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
    y += imgHeight + 10;
  }

  doc.save(`Pharmacy_Report_${pharmacy.name.replace(/\s+/g, "_")}.pdf`);
};

  const columns = [
    { name: "Generic Name", selector: (row) => row.medicine.genericName, sortable: true },
    { name: "Brand Name", selector: (row) => row.medicine.brandName, sortable: true },
    { name: "Category", selector: (row) => row.medicine.category.map((cat) => cat.name).join(", "), sortable: true },
    {
      name: "Expiry Dates",
      selector: (row) =>
        row.expirationPerStock.map((exp) => new Date(exp.expirationDate).toLocaleDateString()).join(", "),
      sortable: true,
    },
  ];

 
  return (
    <div className="p-6">
      {/* 🏪 Pharmacy Info */}
      {pharmacy && (
        
        <div className="bg-white shadow rounded-md p-4 mb-6">
          {/* Flex container for name and button */}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="text-2xl font-bold">{pharmacy.name}</h2>
            <button
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              title="Export Pharmacy Report as PDF"
            >
              Export as PDF
            </button>
          </div>

          <p className="text-gray-700">
            📍{pharmacy.street || ''}, {pharmacy.barangay || ''}, {pharmacy.city || 'N/A'}
          </p>
          <p className="text-gray-600">
            📅{pharmacy.pharmacyDetails?.businessDays || 'N/A'}
          </p>
          <p className="text-gray-600">
            🕒{pharmacy.pharmacyDetails?.openingHour || 'N/A'} - {pharmacy.pharmacyDetails?.closingHour || 'N/A'}
          </p>
        </div>
      )}

      {/* 🔹 Tabs */}
      <div className="flex border-b mb-4">
        {["overview", "expiring", "charts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab === "expiring" ? "Expiring Medicines" : tab}
          </button>
        ))}
      </div>

      {/* 🔹 Tab Content */}
      <div className="bg-white shadow-md rounded-md p-4">
      {activeTab === "overview" && (
        <div>
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
        </div>
      )}
        {activeTab === "expiring" && (
          <div className="p-2">
            {loading ? (
              <PulseSpinner />
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">Expiring Medicines</h1>
                  <input
                    type="text"
                    placeholder="Search by Generic or Brand Name"
                    onChange={(e) => searchMedications(e.target.value)}
                    className="border rounded px-3 py-2 w-96"
                  />
                </div>

                <div className="flex gap-4 mb-4">
                  {["all", "week", "month", "3months", "6months"].map((filter) => (
                    <button
                      key={filter}
                      className={`px-4 py-2 rounded ${
                        expiryFilter === filter ? "bg-blue-500 text-white" : "bg-gray-300"
                      }`}
                      onClick={() => handleExpiryFilterChange(filter)}
                    >
                      {filter === "all" ? "All" : filter.replace(/(\d)(months?)/, "$1 $2")}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-gray-100 border rounded mb-4">
                  <h3 className="text-lg font-bold mb-2">Select Date Range</h3>
                  <div className="flex gap-4">
                    <DatePicker
                      selected={selectedDates.start}
                      onChange={(date) =>
                        setSelectedDates((prev) => ({ ...prev, start: date, end: null }))
                      }
                      selectsStart
                      startDate={selectedDates.start}
                      endDate={selectedDates.end}
                      placeholderText="Start Date"
                    />
                    <DatePicker
                      selected={selectedDates.end}
                      onChange={(date) => {
                        if (date >= selectedDates.start) {
                          setSelectedDates((prev) => ({ ...prev, end: date }));
                          filterByCustomDates(selectedDates.start, date);
                        }
                      }}
                      selectsEnd
                      startDate={selectedDates.start}
                      endDate={selectedDates.end}
                      minDate={selectedDates.start}
                      placeholderText="End Date"
                    />
                  </div>
                </div>

                <DataTable
                  title="Medicines"
                  columns={columns}
                  data={medicationsFilter}
                  pagination
                  highlightOnHover
                  customStyles={{
                    header: { style: { backgroundColor: "#0B607E", color: "white" } },
                    rows: {
                      style: {
                        "&:nth-of-type(odd)": { backgroundColor: "lightgray" },
                        "&:nth-of-type(even)": { backgroundColor: "white" },
                      },
                    },
                  }}
                />
              </>
            )}
            <ToastContainer />
          </div>
        )}
{activeTab === "charts" && (
  <div className="p-4 space-y-8">
    {/* Customer Review Chart */}
    {chartData1 && (
      <div ref={chartRef1} className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Reviews</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData1} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="star" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#36A2EB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Expiring Medicine Stock Chart */}
    {chartData2 && (
      <div ref={chartRef2} className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Expiring Medicine Stock</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData2} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#FF9F40" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
)}

      </div>
    </div>
  );
}

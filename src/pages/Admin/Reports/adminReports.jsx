import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsersBetweenLines,
  faTags,
  faPills,
  faHospital,
  faBarcode,
  faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from "html2canvas";
import * as XLSX from 'xlsx';
import moment from 'moment';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';
import { API_URL } from '../../../env';
import ReactModal from 'react-modal';

ReactModal.setAppElement('#root');
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);

  // overview
   const [counts, setCounts] = useState({
      users: 0,
      pharmacies: 0,
      categories: 0,
      medicines: 0,
      scannedPrescriptions: 0,
      pendingPharmacies: 0
    });



  const fetchPharmacies = async () => {
    try {
      const pharmaciesRes = await axios.get(`${API_URL}pharmacies`);
      const expiryPharmaciesRes = await axios.get(`${API_URL}pharmacies/json`);

      const pharmacies = pharmaciesRes.data;
      const expiryPharmacies = expiryPharmaciesRes.data;
      const currentDate = moment();
      const defaultEndDate = moment().add(30, 'days');

     const merged = pharmacies.map(pharmacy => {
      const match = expiryPharmacies.find(
        e => e.pharmacyName.toLowerCase() === pharmacy.userInfo.name.toLowerCase()
      );

      return {
        pharmacyName: pharmacy.userInfo.name,
        expiryDate: match?.expiryDate || null, // format: '22-May-25'
      };
    });

    const filtered = merged.filter(pharmacy => {
      if (!pharmacy.expiryDate) return false;
     const expiryMoment = moment(pharmacy.expiryDate, ['D-MMM-YY', 'DD-MMM-YY'], true);
      return expiryMoment.isValid() &&
        expiryMoment.isAfter(currentDate) &&
        expiryMoment.isBefore(defaultEndDate);
    });

      setPharmacies(merged);
      setFilteredPharmacies(filtered);
    } catch (err) {
      console.error('Failed to fetch pharmacies:', err);
    }
  };

  const applyFilters = () => {
    let filtered = pharmacies.filter(pharmacy =>
      pharmacy.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (startDate && endDate) {
      filtered = filtered.filter(pharmacy => {
        const expiryMoment = moment(pharmacy.expiryDate, 'D-MMM-YY', true);
        return expiryMoment.isValid() &&
          expiryMoment.isBetween(moment(startDate), moment(endDate), null, '[]');
      });
    }

    setFilteredPharmacies(filtered);
  };


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
  
          const scannedPrescriptions = prescriptionRes.data?.totalPrescriptions || 0;
            setCounts({
          users: usersRes.data.length,
          pharmacies: pharmaciesRes.data.length,
          categories: categoriesRes.data.length,
          medicines: medicinesRes.data.length, // <- ✅ Fix here
          pendingPharmacies: pendingPharmacies.length,
          scannedPrescriptions
        });

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };   
      fetchData();
    
    }, []);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, startDate, endDate, pharmacies]);

  //  charts tab
    const [customersData, setCustomersData] = useState(null);
    const [scannedData, setScannedData] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [chartData2, setChartData2] = useState(null);
    const [chartData3, setChartData3] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    // 
    const chartRef1 = useRef(null);
    const chartRef2 = useRef(null);
    const chartRef3 = useRef(null);
    const chartRef4 = useRef(null);
    const chartRef5 = useRef(null);

    
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
  
  const columns = [
    { name: 'Pharmacy Name', selector: row => row.pharmacyName, sortable: true },
    { name: 'Expiry Date', selector: row => row.expiryDate, sortable: true },
  ];

  // === PDF Export Function ===
  const handleExportPDF = async () => {
  const doc = new jsPDF();
  let y = 10;

  // 🔹 Add timestamp
  const now = new Date();
  const formattedTimestamp = now.toLocaleString();
  doc.setFontSize(10);
  doc.text(`Generated on: ${formattedTimestamp}`, 10, y);
  y += 6;

  doc.setFontSize(16);
  doc.text("Admin Reports", 10, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("Overview", 10, y);
  y += 8;

  const overviewTableBody = [
    ["Total Users", counts.users],
    ["Total Pharmacies", counts.pharmacies],
    ["Total Medicines", counts.medicines],
    ["Total Categories", counts.categories],
    ["Scanned Prescriptions", counts.scannedPrescriptions],
    ["Pending Pharmacies", counts.pendingPharmacies],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: overviewTableBody,
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.text("Expiring Pharmacies", 10, y);
  y += 8;

  if (filteredPharmacies?.length > 0) {
    const pharmacyTableBody = filteredPharmacies.map(ph => [
      ph.pharmacyName,
      ph.expiryDate || "N/A"
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Pharmacy Name", "Expiry Date"]],
      body: pharmacyTableBody,
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(12);
    doc.text("No pharmacies with upcoming expiry.", 10, y);
    y += 10;
  }

  doc.setFontSize(14);
  doc.text("Charts Data", 10, y);
  y += 8;

  // Helper to capture chart with prepend workaround
  const captureChart = async (ref) => {
    if (!ref.current) return null;

    const clone = ref.current.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    document.body.prepend(clone);

    await new Promise(resolve => setTimeout(resolve, 300)); // wait for layout
    const canvas = await html2canvas(clone, { useCORS: true });
    document.body.removeChild(clone);

    return canvas.toDataURL("image/png");
  };

  if (customersData?.length > 0) {
    doc.setFontSize(12);
    doc.text("Monthly New Customers", 10, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Month", "Total"]],
      body: customersData.map(({ month, total }) => [month, total]),
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  const chartRefs = [chartRef1, chartRef2, chartRef3, chartRef4, chartRef5];
  const chartTitles = [
    "Monthly New Customers Chart",
    "Most Scanned Prescriptions Chart",
    "Medicine Categories Chart",
    "Pharmacies Per Barangay Chart",
    "Monthly Pharmacy Registration Chart"
  ];

  const chartDataGroups = [
    null,
    scannedData,
    chartData,
    chartData2,
    chartData3
  ];

  const chartTableHeaders = [
    null,
    [["Medicine", "Scans"]],
    [["Category", "Count"]],
    [["Barangay", "Pharmacies"]],
    [["Month", "Registrations"]]
  ];

  const chartTableBodies = [
    null,
    scannedData?.map(({ name, total }) => [name, total]),
    chartData?.map(({ name, value }) => [name, value]),
    chartData2?.map(({ name, population }) => [name, population]),
    chartData3?.map(({ month, total }) => [month, total])
  ];

  for (let i = 0; i < chartRefs.length; i++) {
    const title = chartTitles[i];
    const chartDataGroup = chartDataGroups[i];
    const chartRef = chartRefs[i];

    if (chartDataGroup?.length > 0) {
      doc.setFontSize(12);
      doc.text(title.replace(" Chart", ""), 10, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: chartTableHeaders[i],
        body: chartTableBodies[i],
        theme: "grid",
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    const imgData = await captureChart(chartRef);
    if (imgData) {
      const imgWidth = 180;
      const imgHeight = 120;

      if (y + imgHeight > 280) {
        doc.addPage();
        y = 10;
      }

      doc.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    }
  }

  doc.save("admin-report.pdf");
};


  return (
    <div className="p-6">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="text-2xl font-bold">Admin Reports</h2>
            <button
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              title="Export Pharmacy Report as PDF"
            >
              Export as PDF
            </button>
          </div>
      {/* Tabs */}
      <div className="flex border-b mb-4">
        {['overview', 'pharmacies', 'charts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white shadow-md rounded-md p-4">
       {activeTab === 'overview' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>

          {/* 📊 Stats Grid */}
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
              <div className="stat-title mt-2">Scanned Prescriptions</div>
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
      )}


        {activeTab === 'pharmacies' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pharmacies</h2>

            <div className="flex flex-wrap gap-4 mb-4">
              <input
                type="text"
                placeholder="Search Pharmacy"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-1/3"
              />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="border px-3 py-2 rounded"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                className="border px-3 py-2 rounded"
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredPharmacies}
              pagination
              highlightOnHover
            />
          </div>
        )}

        {activeTab === 'charts' && (
    <div className="bg-primary-t4 min-h-screen flex flex-col p-6">
      <h1 className="text-2xl xl:text-3xl text-primary-default font-extrabold text-center mb-6">
        Summary of Reports
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Monthly New Customers */}
        {customersData && (
        <div ref={chartRef1} className="bg-white shadow rounded-lg p-4">
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
    )}
        {/* Chart 2: Most Scanned Prescriptions */}
        <div ref={chartRef2} className="bg-white shadow rounded-lg p-4">
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
      <div ref={chartRef3} className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Medicine Categories</h2>
        <ResponsiveContainer width="100%" height={550}> {/* increased from 300 to 400 */}
          {isLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <PieChart width={400} height={400}> {/* optional: increase chart size */}
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140} // increased from 120
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>


        {/* Chart 4: Placeholder for Additional Chart */}
    <div ref={chartRef4} className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Pharmacies Per Barangay</h2>
      <ResponsiveContainer width="100%" height={550}> {/* increased height */}
        <BarChart
          width={800}
          height={450} // match the container height
          data={chartData2}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70, // slightly increased to accommodate longer labels
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            height={100}
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
        <div ref={chartRef5} className="bg-white shadow rounded-lg p-4">
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
        )}
      </div>
    </div>
  );
};

export default AdminReports;

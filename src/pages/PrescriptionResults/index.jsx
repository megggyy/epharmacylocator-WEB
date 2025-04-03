import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker issue in Leaflet for React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { API_URL } from "../../env";

const PrescriptionResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matchedMedicines = location.state?.matchedMedicines || [];

  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  useEffect(() => {
    if (!Array.isArray(matchedMedicines) || matchedMedicines.length === 0) {
      console.error("❌ Invalid matchedMedicines:", matchedMedicines);
      return;
    }

    // Group medicines to merge duplicates
    const groupedMedicines = matchedMedicines.reduce((acc, medicine) => {
      if (medicine.matchedFrom === "brandName") {
        if (!acc[medicine.brandName]) {
          acc[medicine.brandName] = {
            brandName: medicine.brandName,
            genericNames: new Set(),
            matchedFrom: "brandName",
          };
        }
        acc[medicine.brandName].genericNames.add(medicine.genericName);
      } else {
        if (!acc[medicine.genericName]) {
          acc[medicine.genericName] = {
            genericName: medicine.genericName,
            brandNames: new Set(),
            matchedFrom: "genericName",
          };
        }
        acc[medicine.genericName].brandNames.add(medicine.brandName);
      }
      return acc;
    }, {});

    const optimizedMedicines = Object.values(groupedMedicines).map((med) => ({
      ...med,
      genericNames: med.genericNames ? Array.from(med.genericNames) : [],
      brandNames: med.brandNames ? Array.from(med.brandNames) : [],
    }));

    setMedicines(optimizedMedicines);
  }, [matchedMedicines]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (!Array.isArray(matchedMedicines) || matchedMedicines.length === 0) return;

      try {
        setLoading(true);

        const formattedMedicines = matchedMedicines
          .map((med) => med?.genericName?.trim().toLowerCase())
          .filter(Boolean);

        const response = await axios.post(`${API_URL}medicine/with-medicines`, {
          medicineNames: formattedMedicines,
        });

        setPharmacies(response.data.data || []);
      } catch (err) {
        console.error("❌ API Error:", err.response ? err.response.data : err.message);
        setError("Error fetching pharmacy data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [matchedMedicines]);

  return (
<div className="min-h-screen bg-gray-100 p-6">
  {/* Page Title */}
  <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Pharmacy Results</h1>

  {/* Loading & Error Handling */}
  {loading ? (
    <div className="text-center text-lg font-medium text-gray-600">Loading...</div>
  ) : error ? (
    <div className="text-center text-red-500">{error}</div>
  ) : pharmacies.length > 0 ? (
    <div className="space-y-6">
      {pharmacies.map((item, index) => {
        // Organize medicine stock
        const medicineStockMap = new Map();
        const allMedicines = Object.values(item.medicines.byGeneric || {}).flat();
        allMedicines.forEach((med) => {
          const name = med?.genericName?.trim();
          if (name) {
            medicineStockMap.set(name, (medicineStockMap.get(name) || 0) + (med.stock || 0));
          }
        });

        const uniqueMedicines = Array.from(medicineStockMap, ([genericName, totalStock]) => ({
          genericName,
          totalStock,
        }));

        return (
          <div
            key={item.pharmacy._id || index}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Side - Pharmacy Info & Medicines */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{item.pharmacy.name}</h2>
              <p className="text-gray-600">{item.pharmacy.address.street}, {item.pharmacy.address.barangay}, {item.pharmacy.address.city}</p>
              <p className="text-gray-700">📞 {item.pharmacy.contactNumber}</p>
              <p className="text-gray-700">🕒 {item.pharmacy.businessDays !== "Not Available" ? item.pharmacy.businessDays : "Business hours not available"}</p>
              <p className="text-gray-700">⏰ {item.pharmacy.openingHour !== "Not Available" && item.pharmacy.closingHour !== "Not Available"
                ? `${item.pharmacy.openingHour} - ${item.pharmacy.closingHour}`
                : "Hours not available"}
              </p>

              {/* Available Medicines */}
              <h3 className="text-lg font-semibold text-gray-800 mt-4">Available Medicines:</h3>
              <div className="space-y-2">
                {Object.entries(item.medicines.byGeneric).map(([genericName, brands]) => {
                  const scannedMedicine = medicines.find((med) =>
                    med.genericName?.toLowerCase() === genericName.toLowerCase() ||
                    brands.some((b) => med.brandName?.toLowerCase() === b.brandName?.toLowerCase())
                  );

                  if (scannedMedicine) {
                    return (
                      <div key={genericName} className="bg-gray-100 p-3 rounded-md">
                        {scannedMedicine.matchedFrom === "brandName" ? (
                          <>
                            <p className="font-bold text-gray-800">{scannedMedicine.brandName}</p>
                            <p className="text-gray-700">💊 Generic(s): {scannedMedicine.genericNames.length > 0 ? scannedMedicine.genericNames.join(", ") : "N/A"}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-gray-800">{scannedMedicine.genericName}</p>
                            <p className="text-gray-700">🏷 Brand(s): {scannedMedicine.brandNames.length > 0 ? scannedMedicine.brandNames.join(", ") : "N/A"}</p>
                          </>
                        )}
                        {brands.map((med, i) => (
                          <p key={i} className="text-sm text-gray-600">Stock: {med.stock}</p>
                        ))}
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {/* Right Side - Map */}
            <div className="h-60 md:h-full rounded-lg overflow-hidden">
              <MapContainer
                center={[parseFloat(item.pharmacy.latitude), parseFloat(item.pharmacy.longitude)]}
                zoom={15}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[parseFloat(item.pharmacy.latitude), parseFloat(item.pharmacy.longitude)]}
                  icon={L.icon({ iconUrl: markerIconPng, shadowUrl: markerShadowPng, iconSize: [25, 41], iconAnchor: [12, 41] })}
                >
                  <Popup>{item.pharmacy.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-center text-gray-600 text-lg">No pharmacies found.</p>
  )}
</div>
  );
};

export default PrescriptionResultsScreen;

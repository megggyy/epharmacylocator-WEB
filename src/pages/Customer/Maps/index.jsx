import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { API_URL } from "../../../env";

const TaguigCityMap = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await axios.get(`${API_URL}pharmacies`);
        const approvedPharmacies = response.data.filter(
          (pharmacy) => pharmacy.approved === true
        );
        setPharmacies(approvedPharmacies);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      }
    };

    fetchPharmacies();
  }, []);

  const handleMarkerClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const closeModal = () => {
    setSelectedPharmacy(null);
  };

  return (
    <div className="relative h-screen">
      {/* Map Container */}
      <MapContainer
        center={[14.520445, 121.053886]} // Taguig City Coordinates
        zoom={12}
        style={{ height: "100%", width: "100%", zIndex: 1 }} // Lower z-index for the map
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            position={[
              parseFloat(pharmacy.location.latitude),
              parseFloat(pharmacy.location.longitude),
            ]}
            eventHandlers={{
              click: () => handleMarkerClick(pharmacy),
            }}
          >
            <Popup>
              <strong>{pharmacy.userInfo.name}</strong>
              <br />
              {pharmacy.userInfo.street}, {pharmacy.userInfo.city}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Left Popup Modal */}
      {selectedPharmacy && (
        <div
          className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg p-4 z-50 overflow-y-auto"
          style={{ zIndex: 9999 }} // Highest z-index for modal
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            onClick={closeModal}
          >
            ✕
          </button>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedPharmacy.userInfo.name}
          </h2>
          <img
            src={selectedPharmacy.images?.[0] || "default-image.jpg"}
            alt={selectedPharmacy.userInfo.name}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-600 mb-2">
            <strong>Location:</strong>{" "}
            {`${selectedPharmacy.userInfo.street}, ${selectedPharmacy.userInfo.barangay}, ${selectedPharmacy.userInfo.city}`}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Contact:</strong> {selectedPharmacy.userInfo.contactNumber}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Business Days:</strong> {selectedPharmacy.businessDays}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Store Hours:</strong>{" "}
            {`${selectedPharmacy.openingHour || "N/A"} - ${
              selectedPharmacy.closingHour || "N/A"
            }`}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaguigCityMap;

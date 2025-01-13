import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack, IoLocationOutline, IoCallOutline, IoTimeOutline } from "react-icons/io5";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { API_URL } from "../../env";

const MapResize = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize(); // Ensures the map resizes properly
  }, [map]);
  return null;
};

const PharmacyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}pharmacies/${id}`);
        setPharmacy(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pharmacy details:", error);
        setLoading(false);
      }
    };

    fetchPharmacyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-3xl text-blue-500">Loading...</div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-500">Failed to load pharmacy details.</div>
      </div>
    );
  }

  const { latitude, longitude } = pharmacy.location;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-primary-default text-white p-6 rounded-lg mb-8 relative">
        <h1 className="text-2xl font-bold">{pharmacy.userInfo.name}</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center md:flex-row">
        {/* Left Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start mb-6 md:mb-0">
          <img
            src={pharmacy?.images?.[0] || "https://via.placeholder.com/300"}
            alt={pharmacy.userInfo.name}
            className="w-64 h-64 object-cover rounded-lg mb-6"
          />
          <div>
            <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
            <div className="flex items-center mb-3">
              <IoLocationOutline size={24} className="text-gray-500" />
              <span className="ml-2 text-gray-700">
                {`${pharmacy.userInfo.street || ""}, ${pharmacy.userInfo.barangay || ""}, ${pharmacy.userInfo.city || ""}`.replace(/(, )+/g, ", ").trim()}
              </span>
            </div>
            <div className="flex items-center mb-3">
              <IoCallOutline size={24} className="text-gray-500" />
              <span className="ml-2 text-gray-700">{pharmacy.userInfo.contactNumber}</span>
            </div>
            <div className="flex items-center mb-3">
              <IoTimeOutline size={24} className="text-gray-500" />
              <span className="ml-2 text-gray-700">
                {`${pharmacy.businessDays} (${pharmacy?.openingHour || "N/A"} - ${pharmacy?.closingHour || "N/A"})`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Location on Map</h2>
          <div className="w-full h-96 bg-gray-300 rounded-lg">
            <MapContainer
              center={[latitude, longitude]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <MapResize />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[latitude, longitude]}>
                <Popup>{pharmacy.userInfo.name}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;

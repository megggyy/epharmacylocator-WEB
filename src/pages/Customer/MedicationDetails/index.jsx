import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack, IoLocationOutline, IoCallOutline, IoCubeOutline } from "react-icons/io5";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { API_URL } from "../../../env";

// Fix Leaflet Marker Icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const MapResize = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize(); // Ensures the map resizes properly
  }, [map]);
  return null;
};

const MedicationDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      axios
        .get(`${API_URL}medicine/available/${name}`)
        .then((response) => {
          setMedications(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching medication details:", error);
          setLoading(false);
        });
    }
  }, [name]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-blue-500">Loading...</div>
      </div>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-500">No medications available.</div>
      </div>
    );
  }

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' }); // Get full month name
    const year = String(date.getFullYear());
    return `${month} ${day}, ${year}`;
  };
  const { name: medicationName } = medications[0];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="text-primary-default p-6 flex items-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 text-white text-2xl"
        >
          <IoArrowBack />
        </button>
        <h1 className="text-2xl font-bold mx-auto">{medicationName}</h1>
      </div>

      <div className="p-6 space-y-6">

        {/* Available Pharmacies */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-center text-white bg-primary-variant p-4 rounded-lg">
            Available Pharmacies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medications.map((medication, index) => {
              const pharmacy = medication.pharmacy || {};
              const userInfo = pharmacy.userInfo || {};
              const location = pharmacy.location || {};

              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md space-y-4"
                >
                  <h3 className="text-xl font-semibold text-center text-primary-variant">
                    {userInfo.name || "Unknown Pharmacy"}
                  </h3>

                  <div className="flex items-center space-x-2">
                    <IoLocationOutline size={20} className="text-gray-500" />
                    <p className="text-gray-700">
                      {`${userInfo.street || ""}, ${userInfo.barangay || ""}, ${userInfo.city || ""}`
                        .replace(/(, )+/g, ", ")
                        .trim()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <IoCallOutline size={20} className="text-gray-500" />
                    <a
                      href={`tel:${userInfo.contactNumber || ""}`}
                      className="text-blue-600 hover:underline"
                    >
                      {userInfo.contactNumber || "N/A"}
                    </a>
                  </div>

                  <div className="flex items-center space-x-2">
                    <IoCubeOutline size={20} className="text-gray-500" />
                    <p className="text-green-600">{medication.stock} in stock</p>
                    <p className="text-black italic">
                      (Last updated on {medication.timeStamps ? formatDateTime(new Date(medication.timeStamps)) : 'No Date Available'})</p>

                  </div>

                  {/* Map Section */}
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[
                        parseFloat(location.latitude) || 0,
                        parseFloat(location.longitude) || 0,
                      ]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <MapResize />
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={[
                          parseFloat(location.latitude) || 0,
                          parseFloat(location.longitude) || 0,
                        ]}
                      >
                        <Popup>
                          {userInfo.name || "Pharmacy"}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MedicationDetails;

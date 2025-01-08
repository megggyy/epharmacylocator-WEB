import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TaguigCityMap = () => {
  return (
    <MapContainer
      center={[14.520445, 121.053886]} // Taguig City Coordinates
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[14.520445, 121.053886]}>
        <Popup>
          Taguig City<br /> Centered on the map.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default TaguigCityMap;

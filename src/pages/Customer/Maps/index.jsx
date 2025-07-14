import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { API_URL } from "../../../env";
import { jwtDecode } from "jwt-decode"; // Assuming you have jwt-decode installed
import { toast } from "react-toastify";
import L from "leaflet"; // Import Leaflet for custom marker icons
import redpin from "@assets/redpinloc.png";
import { useParams, useNavigate } from 'react-router-dom';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => deg * (Math.PI / 180); // Converts degrees to radians
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns distance in kilometers
};

const MapResize = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const MapCenterUpdater = ({ position }) => {
  const map = useMap();
  const [prevPosition, setPrevPosition] = useState(null);

  useEffect(() => {
    if (position) {
      const [newLat, newLng] = position;
      const [prevLat, prevLng] = prevPosition || [];

      if (newLat !== prevLat || newLng !== prevLng) {
        map.panTo(position); // Update the map center without changing the zoom level
        setPrevPosition(position); // Update the stored previous position
      }
    }
  }, [position, map, prevPosition]);

  return null;
};


const TaguigCityMap = () => {
  const [region, setRegion] = useState({
    latitude: 14.520445,
    longitude: 121.053886,
    latitudeDelta: 0.09,
    longitudeDelta: 0.09,
  });
  
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [pharmacySuggestions, setPharmacySuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllPharmacies, setShowAllPharmacies] = useState(true);

  useEffect(() => {
    let locationSubscription;
    let backendPollingInterval;
  
    const updateUserLocationInDatabase = async (latitude, longitude) => {
      try {
        console.log("Updating user location in database...", latitude, longitude);
        const token = await localStorage.getItem("jwt");
        if (!token) return;
  
        const decoded = jwtDecode(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error("User ID not found in token");
  
        const response = await axios.patch(
          `${API_URL}customers/${userId}/update-location`,
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Backend response:", response.data);
      } catch (error) {
        console.error("Error updating user location in database:", error);
      }
    };
  
    const trackUserLocation = () => {
      if (!navigator.geolocation) {
        console.log("Geolocation is not supported by this browser.");
        return;
      }
  
      locationSubscription = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Tracking user location:", latitude, longitude);
  
          setUserLocation({ latitude, longitude });
  
          await updateUserLocationInDatabase(latitude, longitude);
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    };
  
    const fetchLocationFromBackend = async () => {
      try {
        const token = await localStorage.getItem("jwt");
        if (!token) return;
  
        const decoded = jwtDecode(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error("User ID not found in token");
  
        const response = await axios.get(`${API_URL}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data) {
          const { latitude, longitude } = response.data.customerDetails.location || {};
          if (latitude && longitude) {
            setUserLocation((prevLocation) => {
              if (
                prevLocation?.latitude !== parseFloat(latitude) ||
                prevLocation?.longitude !== parseFloat(longitude)
              ) {
                setRegion((prevRegion) => ({
                  ...prevRegion,
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.009,
                }));
              }
  
              return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
            });
          }
        }
      } catch (error) {
        console.error("Error fetching location from backend:", error);
      }
    };
  
    trackUserLocation();
  
    backendPollingInterval = setInterval(fetchLocationFromBackend, 10000);
  
    return () => {
      if (locationSubscription) {
        navigator.geolocation.clearWatch(locationSubscription);
      }
      clearInterval(backendPollingInterval);
    };
  }, []);
  
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const token = await localStorage.getItem("jwt");
        if (!token) {
          setRegion({
            latitude: 14.5350, // Default Taguig
            longitude: 121.0509,
            latitudeDelta: 0.09,
            longitudeDelta: 0.09,
          });
          toast.info("Log in to see your location", {
            position: "top",
            autoClose: 3000,
          });
          return;
        }
        const decoded = jwtDecode(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error("User ID not found in token");
  
        const response = await fetch(`${API_URL}users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
  
        const userLat = parseFloat(data.customerDetails?.location.latitude);
        const userLong = parseFloat(data.customerDetails?.location.longitude);
        setUserLocation({ latitude: userLat, longitude: userLong });
        setRegion((prevRegion) => ({
          ...prevRegion,
          latitude: userLat,
          longitude: userLong,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }));
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };
  
    const fetchPharmacies = async () => {
      try {
        const response = await axios.get(`${API_URL}pharmacies`);
        const approvedPharmacies = response.data.filter(
          (pharmacy) =>
            pharmacy.approved === true &&
            pharmacy.location &&
            !isNaN(parseFloat(pharmacy.location.latitude)) &&
            !isNaN(parseFloat(pharmacy.location.longitude))
        );
        setPharmacies(approvedPharmacies);
        setFilteredPharmacies(approvedPharmacies); // Default to show all pharmacies
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        setIsLoading(false);
      }
    };
  
    fetchUserLocation();
    fetchPharmacies();
  }, []);
  
  const toggleAllPharmacies = () => {
    setShowAllPharmacies(!showAllPharmacies);
    if (showAllPharmacies) {
      // Show only nearby pharmacies
      if (userLocation) {
        const filtered = pharmacies.filter((pharmacy) => {
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            pharmacy.location.latitude,
            pharmacy.location.longitude
          );
          return distance <= 1; // Filter pharmacies within 1 km
        });
        setFilteredPharmacies(filtered);
      }
    } else {
      // Show all pharmacies
      setFilteredPharmacies(pharmacies);
    }
  };

  const handleMarkerClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const closeModal = () => {
    setSelectedPharmacy(null);
  
    if (showAllPharmacies) {
      // Show all pharmacies
      setFilteredPharmacies(pharmacies);
    } else {
      // Show only nearby pharmacies
      if (userLocation) {
        const nearbyPharmacies = pharmacies.filter((pharmacy) => {
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            pharmacy.location.latitude,
            pharmacy.location.longitude
          );
          return distance <= 1; // Within 1 km
        });
        setFilteredPharmacies(nearbyPharmacies);
      } else {
        setFilteredPharmacies([]);
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  
    if (!query.trim()) {
      // Reset pharmacies based on toggle state
      if (showAllPharmacies) {
        setFilteredPharmacies(pharmacies);
      } else if (userLocation) {
        const nearbyPharmacies = pharmacies.filter((pharmacy) => {
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            pharmacy.location.latitude,
            pharmacy.location.longitude
          );
          return distance <= 1; // Show only nearby pharmacies within 1 km
        });
        setFilteredPharmacies(nearbyPharmacies);
      } else {
        setFilteredPharmacies([]); // No nearby pharmacies to show
      }
      setPharmacySuggestions([]);
      return;
    }
  
    const suggestions = pharmacies.filter((p) =>
      p.userInfo.name.toLowerCase().includes(query.toLowerCase())
    );
    const filteredSuggestions = showAllPharmacies
      ? suggestions
      : suggestions.filter((p) => {
          if (!userLocation) return false;
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            p.location.latitude,
            p.location.longitude
          );
          return distance <= 1;
        });
  
    setPharmacySuggestions(filteredSuggestions.slice(0, 5));
    setFilteredPharmacies(filteredSuggestions);
  };
  

  const handleSuggestionSelect = (pharmacy) => {
    setSearchQuery(pharmacy.userInfo.name);
    setFilteredPharmacies([pharmacy]);
    setSelectedPharmacy(pharmacy);
    setRegion({
      latitude: parseFloat(pharmacy.location.latitude),
      longitude: parseFloat(pharmacy.location.longitude),
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    });
    setPharmacySuggestions([]);
  };

  // Create a red icon for pharmacies
  const pharmacyIcon = new L.Icon({
    iconUrl: redpin, // Correctly reference the imported image
    iconSize: [41, 38], // Size of the marker
    iconAnchor: [12, 41], // Anchor point of the icon
    popupAnchor: [1, -34], // Popup position
  });

  return (
    <div className="relative" style={{ height: "87vh" }}>
   {/* Search Bar */}
    <div className="absolute top-4 right-4 z-50 flex flex-col items-start bg-white shadow-md p-2 w-96 rounded-lg">
      <div className="flex items-center w-full">
        <input
          type="text"
          className="w-full p-2 text-gray-700 rounded-l-md focus:outline-none border border-gray-300"
          placeholder="Search for a pharmacy..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyUp={(e) => handleSearch(e.target.value)}
        />
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 hover:scale-105 transition-all duration-300">
          Search
        </button>
      </div>
      {pharmacySuggestions.length > 0 && (
        <ul className="absolute top-full mt-1 left-0 bg-white shadow-lg rounded-lg w-full max-h-60 overflow-y-auto z-50">
          {pharmacySuggestions.map((pharmacy) => (
            <li
              key={pharmacy.id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSuggestionSelect(pharmacy)}
            >
              {pharmacy.userInfo.name}
            </li>
          ))}
        </ul>
      )}
    </div>

      {/* Map Container */}
      <MapContainer
       center={[
        userLocation?.latitude || region.latitude,
        userLocation?.longitude || region.longitude,
      ]}
        zoom={15}
        style={{ height: "100%", width: "100%", zIndex: 1 }} // Lower z-index for the map
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
       <MapResize />
      <MapCenterUpdater
        position={
          selectedPharmacy &&
          selectedPharmacy.location &&
          !isNaN(parseFloat(selectedPharmacy.location.latitude)) &&
          !isNaN(parseFloat(selectedPharmacy.location.longitude))
            ? [
                parseFloat(selectedPharmacy.location.latitude),
                parseFloat(selectedPharmacy.location.longitude),
              ]
            : [
                userLocation?.latitude || region.latitude,
                userLocation?.longitude || region.longitude,
              ]
        }
      />
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

{filteredPharmacies.map((pharmacy) => {
  const lat = parseFloat(pharmacy.location.latitude);
  const lng = parseFloat(pharmacy.location.longitude);

  if (isNaN(lat) || isNaN(lng)) {
    console.warn("Skipping invalid pharmacy location:", pharmacy);
    return null; // Skip rendering if location is invalid
  }

  return (
    <Marker
      key={pharmacy.id}
      position={[lat, lng]}
      icon={pharmacyIcon}
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
  );
})}

      </MapContainer>

      <button
        className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        style={{ zIndex: 10000 }} // Set a high z-index for the button to be on top
        onClick={toggleAllPharmacies}
      >
        {showAllPharmacies ? "Show Nearby" : "Show All Pharmacies"}
      </button>

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
          {`${selectedPharmacy.openingHour || "N/A"} - ${selectedPharmacy.closingHour || "N/A"}`}
        </p>

        {/* View Pharmacy Button */}
        <button
          className="w-full py-2 bg-primary-variant text-white rounded-lg mt-4 hover:bg-blue-700"
          style={{ zIndex: 10000 }} // Ensure button is on top with z-index
          onClick={() => {
            closeModal(); // Close modal before navigation
            navigate(`/customer/PharmacyDetails/${selectedPharmacy._id}`); // Navigate to the PharmacyDetails screen
          }}
        >
          View Pharmacy
        </button>
      </div>
    )}


    </div>
  );
};

export default TaguigCityMap;

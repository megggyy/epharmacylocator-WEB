import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import logo2 from "@assets/epharmacylogoblue.png";

const MapResize = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const CenterMapView = ({ latitude, longitude }) => {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [latitude, longitude, map]);
  return null;
};

const CustomerSignup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [customDisease, setCustomDisease] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState(null);
  const [images, setImages] = useState([]);

  const diseases = [
    { value: "diabetes", label: "Diabetes" },
    { value: "hypertension", label: "Hypertension" },
    { value: "others", label: "Others" },
  ];

  const barangays = [
    { value: "barangay1", label: "Barangay 1" },
    { value: "barangay2", label: "Barangay 2" },
  ];

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setLatitude(lat);
    setLongitude(lng);
    setRegion({ latitude: lat, longitude: lng });
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setLatitude(latitude);
      setLongitude(longitude);
      setRegion({ latitude, longitude });
    });
  };

  const register = () => {
    // Registration logic here
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = Array.from(files).map((file) => ({
      id: file.name,
      uri: URL.createObjectURL(file),
    }));
    setImages([...images, ...uploadedImages]);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="lg:w-1/3 bg-primary-t3 text-white flex flex-col items-center justify-center p-6">
        <img src={logo2} alt="ePharmacy Logo" className="w-48 h-48 mb-4" />
        <h1 className="text-3xl font-bold text-primary-default">ePharmacy </h1>
        <p className="text-lg mt-2 text-center text-primary-variant"> 
          Welcome to ePharmacy Locator. Sign up to get started.
        </p>
      </div>

      <div className="lg:w-2/3 bg-white p-8">
        <h2 className="text-2xl font-bold text-primary-default mb-6">Sign Up as Customer</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
          <input
            type="tel"
            placeholder="Contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
           <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-3 text-gray-700 w-full pr-10"
            />
            <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
                <i className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}></i>
            </button>
            </div>

          <Select
            options={diseases}
            value={selectedDisease}
            onChange={(value) => {
              setSelectedDisease(value);
              if (value?.value !== "others") setCustomDisease("");
            }}
            placeholder="Choose your disease"
            className="text-gray-700"
          />
          {selectedDisease?.value === "others" && (
            <input
              type="text"
              placeholder="Please Specify"
              value={customDisease}
              onChange={(e) => setCustomDisease(e.target.value)}
              className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
            />
          )}
          <input
            type="text"
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
         
            <Select
              options={barangays}
              value={barangay}
              onChange={setBarangay}
              placeholder="Select your barangay"
              className="text-gray-700"
            />
            <input
              type="text"
              value="Taguig City"
              readOnly
              className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
            />
        
        </div>

        {/* Split Layout: Map on the left and Image Upload on the right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Side: Map and Location Button */}
          <div>
            <label className="block text-gray-700 font-semibold mt-4">Pin Exact Location</label>
            <MapContainer
            center={region || [14.5547, 121.0509]} 
            zoom={13}
            className="h-64 w-full rounded-md mb-4"
            whenCreated={(mapInstance) => {
                useMapEvents({
                click: handleMapClick,
                });
            }}
            >
            <MapResize />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {latitude && longitude && (
                <>
                <Marker position={[latitude, longitude]} />
                <CenterMapView latitude={latitude} longitude={longitude} />
                </>
            )}
            </MapContainer>

            {latitude && longitude && (
              <div className="flex justify-between mb-4">
                <p className="bg-gray-200 p-3 rounded-md">Latitude: {latitude.toFixed(5)}</p>
                <p className="bg-gray-200 p-3 rounded-md">Longitude: {longitude.toFixed(5)}</p>
              </div>
            )}

            <button
              onClick={getCurrentLocation}
              className="w-full bg-primary-variant text-white p-3 rounded-md mb-4"
            >
              Use Current Location
            </button>
          </div>

          {/* Right Side: Image Upload and Register Button */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 mt-4">Upload Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              className="w-full bg-gray-200 p-3 rounded-md"
            />

            <div className="grid grid-cols-3 gap-2 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative">
                  <img src={img.uri} alt={img.id} className="w-full h-20 object-cover rounded-md" />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={register}
              className="w-full bg-secondary-variant text-white p-3 rounded-md"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;

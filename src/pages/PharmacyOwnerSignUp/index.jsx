import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { IoArrowBack, IoEye, IoEyeOff, IoClose } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
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

const PharmacyOwnerSignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [businessDays, setBusinessDays] = useState("");
  const [city] = useState("Sample City");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [openingHour, setOpeningHour] = useState(new Date());
  const [closingHour, setClosingHour] = useState(new Date());
  const [images, setImages] = useState([]);
  const [permits, setPermits] = useState([]);
  const [region, setRegion] = useState(null);

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

  const barangays = [
    { value: "barangay1", label: "Barangay 1" },
    { value: "barangay2", label: "Barangay 2" },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handlePermitUpload = (e) => {
    const files = Array.from(e.target.files);
    setPermits((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removePermit = (index) => {
    setPermits((prev) => prev.filter((_, i) => i !== index));
  };

  const register = () => {
    // Registration logic here
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section */}
      <div className="lg:w-1/3 bg-primary-t3 text-white flex flex-col items-center justify-center p-6">
       <img src={logo2} alt="ePharmacy Logo" className="w-48 h-48 mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-primary-default">ePharmacy Locator</h1>
        <p className="text-lg text-center text-primary-variant">Manage your pharmacy by signing up here.</p>
      </div>

      {/* Right Section */}
      <div className="lg:w-2/3 bg-white p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary-default ">Sign-up as a Pharmacy Owner</h2>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3"
          />
          <input
            type="tel"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border border-gray-300 rounded-md p-3 w-full pr-10"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>
        </div>

        {/* Address & Business Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <input
            type="text"
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3"
          />
          <input
            type="text"
            value={businessDays}
            onChange={(e) => setBusinessDays(e.target.value)}
            placeholder="Business Days"
            className="bg-white border border-gray-300 rounded-md p-3"
          />
       <Select
        options={barangays}
        value={barangay}
        onChange={setBarangay}
        placeholder="Select your barangay"
        className="text-gray-700"
        styles={{
            menu: (provided) => ({
            ...provided,
            zIndex: 9999, // Ensure the dropdown is on top
            }),
        }}
        />
          <input
            type="text"
            value={city}
            readOnly
            className="bg-white border border-gray-300 rounded-md p-3"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Map Section */}
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

          {/* Opening and Closing Hours */}
          <div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">Opening Hour</label>
                <DatePicker
                  selected={openingHour}
                  onChange={(date) => setOpeningHour(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full bg-white border border-gray-300 rounded-lg p-3"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">Closing Hour</label>
                <DatePicker
                  selected={closingHour}
                  onChange={(date) => setClosingHour(date)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full bg-white border border-gray-300 rounded-lg p-3"
                />
              </div>
            </div>

            {/* Image and Permit Upload */}
            <div className="mt-6">
              <label className="block font-semibold mb-2">Upload Images</label>
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="bg-white border border-gray-300 rounded-md p-3 w-full"
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="Uploaded"
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <IoClose />
                    </button>
                  </div>
                ))}
              </div>

              <label className="block font-semibold mt-4 mb-2">Upload Permits</label>
              <input
                type="file"
                multiple
                onChange={handlePermitUpload}
                className="bg-white border border-gray-300 rounded-md p-3 w-full"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {permits.map((permit, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(permit)}
                      alt="Permit"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePermit(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <IoClose />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={register}
          className="w-full bg-secondary-variant text-white p-3 rounded-md"
            >
          Register
        </button>
      </div>
    </div>
  );
};

export default PharmacyOwnerSignupScreen;

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { IoArrowBack, IoEye, IoEyeOff, IoClose } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import logo2 from "@assets/epharmacylogoblue.png";
import { API_URL } from "../../env";
import axios from "axios";
import mime from "mime";
import { ToastContainer, toast } from "react-toastify";

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
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [businessDays, setBusinessDays] = useState("");
  const [city, setCity] = useState("Taguig City");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [openingHour, setOpeningHour] = useState(new Date());
  const [closingHour, setClosingHour] = useState(new Date());
  const [images, setImages] = useState([]);
  const [permits, setPermits] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [region, setRegion] = useState(null);
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showOpeningTime, setShowOpeningTime] = useState(false);
  const [showClosingTime, setShowClosingTime] = useState(false);


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

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const response = await axios.get(`${API_URL}barangays`);
        const formattedBarangays = response.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setBarangays(formattedBarangays);
      } catch (error) {
        console.error("Error fetching barangays:", error);
        toast.error("Failed to load barangays. Please try again later.");
      }
    };
    fetchBarangays();
  }, []);

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = Array.from(files).map((file) => ({
      id: file.name,
      uri: URL.createObjectURL(file),
      file: file,
    }));
    setImages([...images, ...uploadedImages]);
  };

  const handlePermitUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = Array.from(files).map((file) => ({
      id: file.name,
      uri: URL.createObjectURL(file),
      file: file,
    }));
    setPermits([...permits, ...uploadedImages]);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const removePermit = (index) => {
    setPermits(permits.filter((img) => img.id !== id));
  };

  const validate = () => {
    let errorMessages = {};
    if (!name) errorMessages.name = "NAME IS REQUIRED";
    if (!email) errorMessages.email = "EMAIL IS REQUIRED";
    if (!contactNumber) errorMessages.contactNumber = "CONTACT NUMBER IS REQUIRED";
    if (!password) errorMessages.password = "PASSWORD IS REQUIRED";
    if (!street) errorMessages.street = "STREET IS REQUIRED";
    if (password.length < 8 && password.length > 0) errorMessages.password = "PASSWORD MUST BE AT LEAST 8 CHARACTERS";
    if (contactNumber.length !== 11) errorMessages.contactNumber = "CONTACT NUMBER MUST BE 11 DIGITS";
    if (!barangay) errorMessages.barangay = "PLEASE SELECT YOUR BARANGAY";
    if (images.length === 0) errorMessages.images = "PLEASE UPLOAD AT LEAST ONE IMAGE";
    if (permits.length === 0) errorMessages.permits = "PLEASE UPLOAD YOUR BUSINESS PERMIT";
    if (!businessDays) errorMessages.businessDays = "PLEASE SELECT BUSINESS DAYS";
    if (!openingHour || !closingHour) errorMessages.hours = "PLEASE SELECT OPENING AND CLOSING HOURS";

    return errorMessages;
  };

  const register = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const data = new FormData();

    // Add the state variables to the formData
    data.append("name", name);
    data.append("email", email);
    data.append("contactNumber", contactNumber);
    data.append("password", password);
    data.append("street", street);
    data.append("city", city);
    data.append("barangay", barangay.value);
    data.append("region", JSON.stringify(region)); // Optional if needed
    data.append("latitude", latitude);
    data.append("longitude", longitude);
    data.append("isAdmin", false);
    data.append("role", "PharmacyOwner");
    data.append("approved", false);
    data.append("businessDays", businessDays);
    data.append("openingHour", openingHour.toISOString());
    data.append("closingHour", closingHour.toISOString());

    // Append images to FormData
    images.forEach((image, index) => {
      data.append("images", image.file, `image${index}.${mime.getExtension(image.file.type)}`);
    });

    permits.forEach((permit, index) => {
      data.append("permits", permit.file, `image${index}.${mime.getExtension(permit.file.type)}`);
    });

    try {
      const response = await axios.post(`${API_URL}users/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        const userId = response.data.userId;
        setUserId(userId);
        toast.success("Registration succeeded! Please verify your OTP.");
        setIsOtpModalOpen(true);
      }
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        if (message === "NOT_UNIQUE_EMAIL") {
          toast.error("Email already in use. Please use a different email.");
        } else if (message === "NOT_UNIQUE_CONTACT_NUMBER") {
          toast.error("Contact number already in use. Please use a different contact number.");
        } else {
          toast.error("Registration failed. Please try again later.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to the next input field
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join(""); // Combine OTP digits into a single string
    if (otpValue.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      // Replace with your OTP verification API call
      const response = await axios.post(`${API_URL}users/verifyOTP`, {
        userId,
        otp: otpValue,
      });
      if (response.status === 200) {
        setIsOtpModalOpen(false);
        navigate('/login');
        toast.success("OTP verified successfully! Wait for your account to be approved.");
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };


  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <ToastContainer />
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
          {/* Name */}
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border border-gray-300 rounded-md p-3"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-gray-300 rounded-md p-3"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Contact Number */}
          <div className="flex flex-col">
            <input
              type="tel"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="bg-white border border-gray-300 rounded-md p-3"
            />
            {errors.contactNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
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
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>


        {/* Address & Business Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Street */}
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="bg-white border border-gray-300 rounded-md p-3"
            />
            {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
          </div>

          {/* Business Days */}
          <div className="flex flex-col">
            <input
              type="text"
              value={businessDays}
              onChange={(e) => setBusinessDays(e.target.value)}
              placeholder="Business Days"
              className="bg-white border border-gray-300 rounded-md p-3"
            />
            {errors.businessDays && (
              <p className="text-xs text-red-500 mt-1">{errors.businessDays}</p>
            )}
          </div>

          {/* Barangay Select */}
          <div className="flex flex-col">
            <Select
              options={barangays}
              value={barangay}
              onChange={setBarangay}
              placeholder="Select your barangay"
              className="text-gray-700"
              styles={{
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
            {errors.barangay && (
              <p className="text-xs text-red-500 mt-1">{errors.barangay}</p>
            )}
          </div>

          {/* City (Read-only) */}
          <div className="flex flex-col">
            <input
              type="text"
              value={city}
              readOnly
              className="bg-white border border-gray-300 rounded-md p-3"
            />
          </div>
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

          <div>
            {/* Opening and Closing Hours */}
            <div>
              <div className="flex gap-4">
                {/* Opening Hour */}
                <div className="flex-1 flex flex-col">
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
                  {errors.openingHour && (
                    <p className="text-xs text-red-500 mt-1">{errors.openingHour}</p>
                  )}
                </div>

                {/* Closing Hour */}
                <div className="flex-1 flex flex-col">
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
                  {errors.closingHour && (
                    <p className="text-xs text-red-500 mt-1">{errors.closingHour}</p>
                  )}
                </div>
              </div>
            </div>


            {/* Image and Permit Upload */}
            <div className="mt-6">
              {/* Image Upload */}
              <div className="flex flex-col">
                <label className="block font-semibold mb-2">Upload Images</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="bg-white border border-gray-300 rounded-md p-3 w-full"
                />
                {errors.images && (
                  <p className="text-xs text-red-500 mt-1">{errors.images}</p>
                )}
              </div>

              {/* Uploaded Images Preview */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img.uri} alt={img.id} className="w-full h-20 object-cover rounded-md" />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <IoClose />
                    </button>
                  </div>
                ))}
              </div>

              {/* Permits Upload */}
              <div className="flex flex-col mt-4">
                <label className="block font-semibold mb-2">Upload Permits</label>
                <input
                  type="file"
                  multiple
                  onChange={handlePermitUpload}
                  className="bg-white border border-gray-300 rounded-md p-3 w-full"
                />
                {errors.permits && (
                  <p className="text-xs text-red-500 mt-1">{errors.permits}</p>
                )}
              </div>

              {/* Uploaded Permits Preview */}
              <div className="flex flex-wrap gap-2 mt-4">
                {permits.map((permit, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img src={permit.uri} alt={permit.id} className="w-full h-20 object-cover rounded-md" />
              
                    <button
                      onClick={() => removePermit(permit.id)}
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

        {/* OTP Modal */}
        <Modal open={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} center>
          <h2 className="text-xl font-bold text-center">OTP Verification</h2>
          <p className="text-center text-gray-600">Enter the 4-digit OTP sent to your email or phone.</p>
          <div className="flex justify-center gap-2 my-4">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="w-10 h-12 text-center border border-gray-300 rounded-md"
              />
            ))}
          </div>
          <button
            onClick={handleVerifyOtp}
            className="w-full bg-primary-variant text-white p-3 rounded-md mt-4"
          >
            Verify OTP
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default PharmacyOwnerSignupScreen;

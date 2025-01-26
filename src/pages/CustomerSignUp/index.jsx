import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

const CustomerSignup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Taguig City");
  const [barangay, setBarangay] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState(null);
  const [images, setImages] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
  }, [API_URL]);

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
    if (!agreedToTerms) errorMessages.terms = "YOU MUST AGREE TO THE TERMS AND CONDITIONS";
    return errorMessages;
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = Array.from(files).map((file) => ({
      id: file.name,
      uri: URL.createObjectURL(file),
      file: file,
    }));
    setImages([...images, ...uploadedImages]);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
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
    data.append("role", "Customer");
  
    // Append images to FormData
    images.forEach((image, index) => {
      data.append("images", image.file, `image${index}.${mime.getExtension(image.file.type)}`);
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
        toast.success("OTP verified successfully!");
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
    <ToastContainer />
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
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>
        <div className="flex flex-col">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
        <div className="flex flex-col">
          <input
            type="tel"
            placeholder="Contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
          {errors.contactNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>
          )}
        </div>
        <div className="relative flex flex-col">
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
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>
  
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
          {errors.street && (
            <p className="text-xs text-red-500 mt-1">{errors.street}</p>
          )}
        </div>
  
        <div className="flex flex-col">
          <Select
            options={barangays}
            value={barangay}
            onChange={setBarangay}
            placeholder="Select your barangay"
            className="text-gray-700"
          />
          {errors.barangay && (
            <p className="text-xs text-red-500 mt-1">{errors.barangay}</p>
          )}
        </div>
  
        <div className="flex flex-col">
          <input
            type="text"
            value="Taguig City"
            readOnly
            className="bg-white border border-gray-300 rounded-md p-3 text-gray-700"
          />
        </div>
      </div>
  
      {/* Split Layout: Map on the left and Image Upload on the right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Map and Location Button */}
        <div className="flex flex-col h-auto mb-4">
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
        {errors.images && (
          <p className="text-xs text-red-500 mt-1">{errors.images}</p>
        )}
        <div className="mt-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700">I agree to the</span>
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="text-blue-500 underline ml-1"
            >
              Terms and Conditions
            </button>
          </label>
          {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
        </div>
        <button
          onClick={register}
          className="w-full bg-secondary-variant text-white p-3 rounded-md"
        >
          Register
        </button>
      </div>
      <Modal
        open={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        center
        classNames={{
          modal: "modal-content",
          closeButton: "modal-close-button",
        }}
        styles={{
          modal: {
            width: "90%",
            maxWidth: "600px",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 className="text-2xl font-semibold mb-4 text-center">Terms and Conditions</h3>
        <p className="text-sm text-gray-700 mb-4">
          Welcome to ePharmacy Locator. By using our service, you agree to the following terms:
        </p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800">1. User Privacy</h4>
            <p className="text-sm text-gray-700">
              We are committed to protecting your privacy. All personal data shared with us will be stored securely and
              will only be used for the purpose of providing services related to ePharmacy Locator.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800">2. Pharmacy Responsibility</h4>
            <p className="text-sm text-gray-700">
              Pharmacies are responsible for providing accurate and up-to-date information regarding their locations,
              stock of medicines, and operating hours. Pharmacies must submit their permits for approval before being listed
              in the system. We encourage pharmacies to regularly update their stock to ensure accurate information is available
              to customers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800">3. Medicine Stock Information</h4>
            <p className="text-sm text-gray-700">
              The system displays medicine stock information provided by pharmacies. We are not responsible for any inaccuracies
              or discrepancies in stock data. The last update date for each pharmacy's medicine stock will be displayed, ensuring
              transparency. 
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800">4. Limitation of Liability</h4>
            <p className="text-sm text-gray-700">
              ePharmacy Locator is not responsible for any consequences arising from the use of the information provided by pharmacies.
              While we strive to ensure the accuracy of the data, we cannot guarantee that all information is free from errors.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800">5. User Actions</h4>
            <p className="text-sm text-gray-700">
              Users of ePharmacy Locator are verified and are restricted to the following actions:
              <ul className="list-disc pl-5 text-gray-700">
                <li>Searching for medicines and pharmacies.</li>
                <li>Locating pharmacies by search, nearby, or all pharmacies.</li>
                <li>Uploading prescriptions for pharmacy verification.</li>
                <li>Managing their profile information.</li>
              </ul>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800">6. Terms of Use</h4>
            <p className="text-sm text-gray-700">
              By agreeing to these terms, you confirm that you will not misuse the system, provide false or misleading information,
              or engage in any activity that could harm the functionality of the platform or other users.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            setAgreedToTerms(true);
            setIsTermsOpen(false); // Close the modal
          }}
          className="px-6 py-2 bg-primary-default text-white rounded-full hover:bg-blue-600 focus:outline-none"
        >
            I Agree
          </button>
        </div>
      </Modal>
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
  </div>
  
  );
};

export default CustomerSignup;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import epharmacyLogo from "@assets/epharmacylogoblue.png";
import { API_URL } from '../../env';

const convertToISO = (dateStr) => {
  const [day, monStr, yearSuffix] = dateStr.split("-");
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const year = "20" + yearSuffix;
  const month = months[monStr];
  return `${year}-${month}-${day.padStart(2, '0')}`;
};

const normalizeString = (str) => str.toLowerCase().replace(/[\s-]/g, '');

const checkLicenseDuplicated = async (licenseNumber) => {
  try {
    await axios.get(`${API_URL}users/checkLicenseDuplicated`, {
      params: { licenseNumber },
    });
    return false; // License is available
  } catch (error) {
    if (error.response?.data?.message === 'NOT_UNIQUE_LICENSE_NUMBER') {
      return true; // Duplicate license found
    }
    console.error('Unexpected error during license check:', error);
    throw error;
  }
};

const CheckLicense = () => {
  const [inputDetail, setInputDetail] = useState('');
  const [matchedPharmacies, setMatchedPharmacies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handlePharmacyRedirect = async (pharmacy) => {
    const rawExpiry = pharmacy.expiryDate;
    const isoDateStr = convertToISO(rawExpiry);
    const expiryDate = new Date(isoDateStr);
    const today = new Date();

    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      toast.error("The license for this branch has expired. Please renew the license.", {
        position: "top-center",
      });
      return;
    }

    const isDuplicate = await checkLicenseDuplicated(pharmacy.licenseNumber);
    if (isDuplicate) {
      toast.error("This license number has already been used.", {
        position: "top-center",
      });
      return;
    }

    toast.success("Pharmacy found! Redirecting...", {
      position: "top-center",
    });

    setShowModal(false);
    navigate('/PharmacyOwnerSignup', {
      state: {
        pharmacyName: pharmacy.pharmacyName,
        licenseNumber: pharmacy.licenseNumber,
        expiryDate: pharmacy.expiryDate,
      },
    });
  };

  const handleSubmit = async () => {
    if (!inputDetail) {
      toast.error('Please enter your pharmacy name or license number.', {
        position: 'top-center',
      });
      return;
    }

    try {
      const res = await axios.get(`${API_URL}pharmacies/json`);
      const pharmacies = res.data;
      const normalizedIdentifier = normalizeString(inputDetail);

      const matched = pharmacies.filter((pharmacy) =>
        normalizeString(pharmacy.licenseNumber) === normalizedIdentifier ||
        normalizeString(pharmacy.pharmacyName) === normalizedIdentifier
      );

      if (matched.length === 0) {
        toast.error('Pharmacy not found! Try inputting license number instead.', {
          position: 'top-center',
        });
        return;
      }

      if (matched.length === 1) {
        await handlePharmacyRedirect(matched[0]);
      } else {
        setMatchedPharmacies(matched);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error Occurred:", error);
      toast.error('Something went wrong! Please try again later.', {
        position: 'top-center',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />

      {/* Upper Section */}
      <div className="flex flex-col items-center justify-center flex-1 bg-[#FFFF] p-8">
        <img src={epharmacyLogo} alt="ePharmacy Logo" className="w-24 h-24 mb-5" />
        <h1 className="text-black text-3xl font-bold">ePharmacy</h1>
      </div>

      {/* Lower Section */}
      <div className="flex-1 bg-white px-5 py-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Verification</h2>
        <p className="text-center text-gray-500 text-base my-4">
          Please enter your pharmacy name or license number to verify its licensing status as per the FDA records.
        </p>
        <input
          type="text"
          value={inputDetail}
          onChange={(e) => setInputDetail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-[#4A8691] text-white rounded-lg py-3 mt-6 text-lg font-medium hover:bg-[#3b6c75] transition-colors"
        >
          Check
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full text-[#357B8E] text-sm font-semibold text-center mt-4"
        >
          Back to Login
        </button>
      </div>

      {/* Modal for multiple matches */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white max-h-[80vh] w-[90%] max-w-md overflow-y-auto p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">Select Branch</h3>
            {matchedPharmacies.map((pharmacy, index) => (
              <button
                key={index}
                className="w-full text-left p-3 bg-gray-100 rounded-md hover:bg-gray-200 mb-2"
                onClick={() => handlePharmacyRedirect(pharmacy)}
              >
                {pharmacy.address}
              </button>
            ))}
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 text-sm text-blue-600 hover:underline text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CheckLicense;

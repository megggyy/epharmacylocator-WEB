import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthGlobal from '@/context/AuthGlobal';
import logoblue from "@assets/epharmacylogoblue.png";

const PharmacyStatus = () => {
  const { state } = useContext(AuthGlobal); // Get authentication state from context
  const navigate = useNavigate();

  return (
    <div className="flex flex-col" style={{ height: "87vh" }}>
      {/* Upper section with background color */}
      <div className="flex flex-1 flex-col justify-center items-center bg-primary-t2">
        <img
          src={logoblue}
          alt="ePharmacy Logo"
          className="w-24 h-24 mb-5"
        />
        <h1 className="text-primary-variant text-2xl font-medium">
          Pharmacy Application Status
        </h1>
      </div>

      {/* Lower section with white background */}
      <div className="flex flex-2 flex-col justify-center items-center bg-white p-5">
        <p className="text-lg text-black text-center mb-5">
          Your Pharmacy Application is still under review. Kindly wait for the
          email that will say your pharmacy is approved so you can access your account. 
          For now, you can browse in the home page.
        </p>

        {/* Go Home Button */}
        <button
          className="bg-teal-700 text-white text-lg py-3 px-16 rounded-md hover:bg-teal-800"
          onClick={() => navigate('/')}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default PharmacyStatus;

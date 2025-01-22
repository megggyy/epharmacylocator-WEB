import React from 'react';
import logo from "./../../assets/epharmacylogoblue.png"

const PulseSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="relative w-24 h-24">
        {/* Spinner Image */}
        <img
          src={logo} // Replace with your image path
          alt="Spinner Logo"
          className="absolute w-full h-full object-contain animate-pulse"
        />
      </div>
    </div>
  );
};

export default PulseSpinner;

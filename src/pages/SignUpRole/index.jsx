import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "@assets/epharmacylogoblue.png";
import customer from "@assets/customerrole.png";
import owner from "@assets/pharmacyownerrole.png";

const RoleSelectionScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-primary-t4 px-6">
      {/* Upper section for the logo and text */}
      <div className="text-center mt-16 mb-0">
        <h1 className="text-4xl font-bold text-[#0F6580]">ePharmacy Locator</h1>
        <p className="text-lg text-gray-600 mt-2">Choose your role to get started</p>
      </div>

      {/* Two-column layout for signup options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mb-10">
        {/* Customer Section */}
        <div className="group flex flex-col items-center bg-white text-[#00A896] rounded-lg p-8 shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl">
          <img
            src={customer}
            alt="Customer"
            className="w-60 h-60 mb-4"
          />
          <h2 className="text-2xl font-semibold mb-4">Sign up as Customer</h2>
          <button
            onClick={() =>
              navigate('/CustomerSignUp')
            }
            className="bg-[#00A896] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#007965] transition-colors"
          >
            Sign Up
          </button>
        </div>

        {/* Pharmacy Owner Section */}
        <div className="group flex flex-col items-center bg-white text-[#00A896] rounded-lg p-8 shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl">
          <img
            src={owner}
            alt="Pharmacy Owner"
            className="w-60 h-60 mb-4"
          />
          <h2 className="text-2xl font-semibold mb-4">Sign up as Pharmacy Owner</h2>
          <button
            onClick={() =>
              navigate('/PharmacyOwnerSignUp')
            }
            className="bg-[#00A896] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#007965] transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Optional: Add a little more space at the bottom if needed */}
      <div className="mb-10"></div>
    </div>
  );
};

export default RoleSelectionScreen;

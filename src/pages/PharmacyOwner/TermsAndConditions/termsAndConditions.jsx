import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PharmacyTermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center bg-[#0B607E] text-white h-16 px-4 shadow">
        <h1 className="text-lg font-bold">Terms and Conditions</h1>
      </div>

      {/* Scrollable content */}
      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            <span className="text-base font-bold">1. Introduction</span>{'\n'}
            Welcome to the ePharmacy Locator System for Pharmacy Owners. These terms and conditions outline your responsibilities and rights as a participating pharmacy.{"\n\n"}

            <span className="text-base font-bold">2. Account Registration</span>{'\n'}
            - You must provide accurate and complete information when registering.{"\n"}
            - You are responsible for maintaining the confidentiality of your login credentials.{"\n\n"}

            <span className="text-base font-bold">3. Data Responsibility</span>{'\n'}
            - You agree to keep medication stock data accurate and up to date.{"\n"}
            - Any misuse or unauthorized access to customer prescription data is strictly prohibited.{"\n\n"}

            <span className="text-base font-bold">4. Prescription Handling</span>{'\n'}
            - Prescriptions received via the platform must be treated securely and confidentially.{"\n"}
            - All prescriptions are encrypted and only accessible by verified users.{"\n\n"}

            <span className="text-base font-bold">5. Platform Usage</span>{'\n'}
            - Use of the platform for unlawful, harmful, or fraudulent activity is forbidden.{"\n"}
            - The system may log your actions for quality assurance and fraud prevention.{"\n\n"}

            <span className="text-base font-bold">6. Data Retention and Deletion</span>{'\n'}
            - Data may be stored as long as necessary for operational purposes.{"\n"}
            - You may request removal of your account or data at any time via support.{"\n\n"}

            <span className="text-base font-bold">7. Modification of Terms</span>{'\n'}
            - These terms may be updated. Continued use implies acceptance of any changes.{"\n\n"}

            <span className="text-base font-bold">8. Contact Us</span>{'\n'}
            For any questions or support, please email epharmacylocator4@gmail.com{"\n"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PharmacyTermsAndConditions;

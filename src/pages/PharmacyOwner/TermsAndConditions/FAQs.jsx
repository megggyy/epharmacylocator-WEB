import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const faqs = [
  {
    question: 'How do I register my pharmacy?',
    answer:
      'You can register your pharmacy by creating an account and providing the required business details, including your license number and location. Once submitted, your account will be verified by the admin.',
  },
  {
    question: 'How can I update my medicine inventory?',
    answer:
      'After logging in, go to your Pharmacy Dashboard and navigate to the "Medicines" tab. From there, you can add, edit, or remove medicines and update stock levels.',
  },
  {
    question: 'How do prescriptions get matched to my pharmacy?',
    answer:
      'When a user uploads a prescription, our system scans the medicines and checks for matches in nearby pharmacies based on stock availability and location proximity.',
  },
  {
    question: 'Can I see who uploaded the prescription?',
    answer:
      'For privacy and compliance reasons, you will only see anonymized details necessary to fulfill the request. Direct user contact is not allowed unless consent is provided.',
  },
  {
    question: 'How do I handle expired medicines?',
    answer:
      'You can monitor and manage expiring medicines in the "Expiring Medicines" tab. We also provide charts and filtering tools to help you identify expiring stock.',
  },
  {
    question: 'Is there a way to export reports?',
    answer:
      'Yes. You can export your pharmacy data, including stock, expiring medicines, and reviews as PDF or Excel files.',
  },
  {
    question: 'What if I forgot my password?',
    answer:
      'Click on the "Forgot Password" link on the login page and follow the steps to reset your password via email verification.',
  },
  {
    question: 'Who do I contact for support?',
    answer:
      'For any concerns or technical issues, you can reach out to our support team at epharmacylocator4@gmail.com.',
  },
];

const PharmacyFAQs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center bg-[#0B607E] text-white h-16 px-4 shadow">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Pharmacy Owner FAQs</h1>
      </div>

      {/* FAQs Content */}
      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-lg shadow-md transition hover:shadow-lg"
          >
            <h2 className="text-md font-semibold text-gray-800 mb-2">
              {faq.question}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyFAQs;

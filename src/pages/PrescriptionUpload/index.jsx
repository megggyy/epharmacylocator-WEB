import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { IoCloudUploadOutline, IoClose, IoFolderOpen } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../env";
import AuthGlobal from "../../context/AuthGlobal";
import Cropper from "react-easy-crop";

const PrescriptionUpload = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [customerId, setCustomerId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
    const [agreedToStore, setAgreedToStore] = useState(null);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const { state } = useContext(AuthGlobal);
    const navigate = useNavigate(); 
    const userId = state?.user?.userId;
  
    // Cropper States
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [showCropPrompt, setShowCropPrompt] = useState(false); // New state for crop prompt
    const [imageSrc, setImageSrc] = useState(null);
  
    useEffect(() => {
      fetchCustomerId();
    }, [userId]);
  
    const fetchCustomerId = async () => {
      if (!userId) return;
  
      try {
        const token = localStorage.getItem("jwt");
        const response = await axios.get(`${API_URL}customers/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomerId(response.data.customerId);
      } catch (error) {
        console.error("Error fetching customer ID:", error.response?.data || error.message);
      }
    };
  
    useEffect(() => {
      if (!customerId) return;
  
      const checkConsent = async () => {
        try {
          const response = await axios.get(`${API_URL}customers/customers/${customerId}`);
          const consent = response.data?.consentGiven;
  
          if (consent === null || consent === undefined) {
            setShowPrivacyNotice(true);
          } else {
            setAgreedToStore(consent);
          }
        } catch (error) {
          console.error("Error fetching consent:", error.response?.data || error.message);
        }
      };
  
      checkConsent();
    }, [customerId]);

    const fetchPrescriptions = async () => {
        if (!customerId) return;
    
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}customers/${customerId}/prescriptions`);
    
          // Filter unique prescriptions based on image URL
          const uniquePrescriptions = [];
          const seenUrls = new Set();
    
          response.data.prescriptions.forEach((prescription) => {
            if (!seenUrls.has(prescription.originalImageUrl)) {
              seenUrls.add(prescription.originalImageUrl);
              uniquePrescriptions.push(prescription);
            }
          });
    
          setPrescriptions(uniquePrescriptions);
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        if (customerId) fetchPrescriptions();
      }, [customerId]);

    const handlePrivacyResponse = async (agree) => {
      if (!customerId) {
        alert("Error: Customer ID is missing.");
        return;
      }
      setShowPrivacyNotice(false);
      setAgreedToStore(agree);
  
      try {
        await axios.post(`${API_URL}customers/customers/consent`, { customerId, consentGiven: agree });
        console.log("Consent updated:", agree);
      } catch (error) {
        console.error("Error updating consent:", error.message);
        alert("Failed to update consent. Please try again.");
      }
    };
  
    const handleReuse = (prescription) => {
        setIsDrawerVisible(false); // Close the modal first
        
        // Navigate to the correct path
        navigate(`/customer/prescription-scan`, {
          state: {
            originalImageUrl: prescription.originalImageUrl,
            processedImageUrl: prescription.processedImageUrl,
            ocrText: prescription.ocrText,
            customerId: prescription.customerId
          }
        });
      };
  
    const handleImageSelection = (event) => {
        const file = event.target.files[0];
      
        // Prevent upload only if consent has not been given yet (null or undefined)
        if (agreedToStore === null || agreedToStore === undefined) {
          alert("You need to agree or decline before uploading.");
          return; // Stop execution
        }
      
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = () => {
            setImageSrc(reader.result);
            setShowCropPrompt(true);  // Show the crop prompt
            setShowCropModal(true);   // Show the crop modal
          };
          reader.readAsDataURL(file);
        }
      };      
  
    const handleCropComplete = (_, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    };
  
    const getCroppedImg = async () => {
      if (!imageSrc || !croppedAreaPixels) return null;
  
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
  
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
  
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
    };
  
    const handleCropConfirm = async () => {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        setShowCropModal(false);
        handleImageUpload(croppedBlob);
      }
    };
  
    const handleImageUpload = async (file) => {
        if (!file) return;
      
        try {
          setLoading(true);
          const formData = new FormData();
          formData.append("prescriptions", file);
      
          const response = await axios.post(`${API_URL}customers/scan-prescription`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
      
          if (!response.data) throw new Error("Empty response from server");
      
          const { ocrText, processedImageUrl, originalImageUrl } = response.data;
      
          if (ocrText && processedImageUrl && originalImageUrl && customerId) {
            // Navigate to the correct path
            navigate(`/customer/prescription-scan`, {
              state: { originalImageUrl, processedImageUrl, ocrText, customerId },
            });
          } else {
            alert("Processing Error: Some required data is missing.");
          }
        } catch (error) {
          console.error("Error processing OCR:", error);
          alert("Failed to process the image. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      
  
    return (
      <div className="min-h-screen flex flex-col items-center bg-blue-50 p-4 relative">
        {/* Privacy Notice Modal */}
        {showPrivacyNotice && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <p className="text-gray-700 text-center">
                To comply with the Data Privacy Act, do you agree to store your prescriptions securely?
              </p>
              <div className="flex justify-between mt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md" onClick={() => handlePrivacyResponse(true)}>
                  Agree
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={() => handlePrivacyResponse(false)}>
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Upload Section */}
        <div className="w-full max-w-md flex flex-col items-center bg-white p-6 rounded-lg shadow-xl mt-20">
          <p className="text-lg font-medium text-gray-700 mb-4">Upload Prescription</p>
  
          <label className="cursor-pointer flex flex-col items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg">
            <IoCloudUploadOutline size={40} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelection} />
          </label>
  
          <button
            className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => setIsDrawerVisible(true)}
          >
            <IoFolderOpen size={20} />
            View Previous Prescriptions
          </button>
        </div>

        {/* Prescription Drawer */}
{isDrawerVisible && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto relative">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        onClick={() => setIsDrawerVisible(false)}
      >
        <IoClose size={24} />
      </button>

      <h2 className="text-xl font-semibold text-center mb-4">Previous Prescriptions</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : prescriptions.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className="bg-gray-100 p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition"
              onClick={() => handleReuse(prescription)}
            >
              <img
                src={prescription.originalImageUrl}
                alt="Prescription"
                className="w-full h-24 object-cover rounded-md"
              />
              <p className="text-xs text-gray-600 mt-2 text-center">Tap to reuse</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No previous prescriptions found.</p>
      )}
    </div>
  </div>
)}


        {/* Cropper Modal */}
        {showCropModal && agreedToStore && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
              {/* Crop Prompt */}
              {showCropPrompt && (
                <div className="mb-4 text-center">
                  <p className="text-gray-700">Please crop out unnecessary details for better accuracy.</p>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
                    onClick={() => setShowCropPrompt(false)}  // Dismiss the prompt
                  >
                    Got It
                  </button>
                </div>
              )}
  
              {/* Cropper Interface */}
              {!showCropPrompt && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Crop Your Image</h2>
                  <div className="relative w-full h-72">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 3}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={handleCropComplete}
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md"
                      onClick={() => setShowCropModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                      onClick={handleCropConfirm}
                    >
                      Confirm Crop
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default PrescriptionUpload;
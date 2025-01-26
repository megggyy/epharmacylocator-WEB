import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { API_URL } from "../../env";
import medicines from "../../assets/medicines";
import PulseSpinner from "../../assets/common/spinner";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { IoArrowBack, IoLocationOutline, IoCallOutline, IoCubeOutline } from "react-icons/io5"; // Import necessary icons
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ToastContainer, toast } from "react-toastify";

// Fix Leaflet Marker Icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const MapResize = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize(); // Ensures the map resizes properly
    }, [map]);
    return null;
};

const PrescriptionUpload = () => {
    const [image, setImage] = useState(null);
    const [ocrText, setOcrText] = useState("");
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [imageUrl, setImageUrl] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const [medicinesList, setMedicinesList] = useState(medicines); // Initialize with the imported medicines data
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [quantity, setQuantity] = useState('');

    const [isMedicineFound, setIsMedicineFound] = useState(false); // Add this state
    const [medicine, setMedicine] = useState([]);

    // Handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
            setIsModalOpen(true); // Open modal after image is uploaded
        }
    };

    // Capture the cropping area
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Crop and Process the image
    const cropAndProcessImage = async () => {
        if (!image || !croppedAreaPixels) return;

        try {
            setLoading(true);

            // Generate cropped image
            const croppedImg = await getCroppedImg(image, croppedAreaPixels);

            // Prepare cropped image for OCR processing
            const formData = new FormData();
            formData.append("prescriptions", croppedImg);

            // API request for OCR processing
            const response = await axios.post(`${API_URL}customers/scan-prescription`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const { ocrText, imageUrl } = response.data;
            setOcrText(ocrText);
            setImageUrl(imageUrl);

            setIsModalOpen(false); // Close modal after processing
        } catch (error) {
            console.error("Error cropping and processing image:", error);
            alert("Failed to process the image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Utility to generate cropped image
    const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
        const image = await createImage(imageSrc);
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

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                blob.name = "cropped-image.jpg";
                resolve(blob);
            }, "image/jpeg");
        });
    };

    // Utility to create an image from a URL
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(error);
        });


        const getMatchedMedicines = () => {
            if (!ocrText) return [];
            
            const ocrWords = ocrText.split(/\s+|\n+/).map(word => word.toLowerCase()).filter(Boolean);
            
            const matchedMedicines = medicinesList.filter(medicine => {
              return ocrWords.some(word => {
                const medicineName = medicine.name.toLowerCase();
                const lowerWord = word.toLowerCase();
                return lowerWord.length >= 5 && medicineName.includes(lowerWord); // Match consecutive substring
              });
            });
            
            return matchedMedicines;
          };

    const handleSelectText = (text) => {
        setIsMedicineFound(false);
        setSelectedText(text);
        setQuantity('')
        setIsModalVisible(true); // Show the modal to input quantity
    };

    const handleSaveQuantity = () => {
        setMedicine('')

        console.log("quant", quantity)
        if (!quantity) {
            toast.error('Please enter a quantity');
        } else {
            setIsModalVisible(false); // Close the modal

            console.log("PICKED" , selectedText)

            axios
            .get(`${API_URL}medicine/available/${selectedText}`)
            .then((response) => {
                console.log(response.data);
        
                const filteredMedicines = response.data.filter((med) => med.stock > parseInt(quantity));
                if (filteredMedicines.length === 0) {
                    toast.info("No pharmacy found with sufficient stock.");
                    setIsMedicineFound(false);
                } else {
                    setMedicine(filteredMedicines);
                    setIsMedicineFound(true);
                    console.log("selected", medicine && medicine.pharmacy)

                }
            })
            .catch((error) => {
                console.error("Error fetching medication details:", error);
                setIsMedicineFound(false);
            });
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <PulseSpinner />
            </div>
        );
    }

    const formatDateTime = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'long' }); // Get full month name
        const year = String(date.getFullYear());
        return `${month} ${day}, ${year}`;
    }; 

    return (
        <div className="min-h-screen bg-gray-100 ">
            <div className="prescription">
                <h1 className="prescription-header">UPLOAD PRESCRIPTION</h1>
                <div className="upload-section">
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>

            {isModalOpen && (
                <div className="prescription-modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                            X
                        </button>
                        <div className="crop-container">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',  // Makes sure the image is contained within the cropper, preserving aspect ratio
                                }}
                            />
                        </div>

                        <button className="crop-process-btn" onClick={cropAndProcessImage} disabled={loading}>
                            {loading ? "Processing..." : "PROCESS"}
                        </button>
                    </div>
                </div>
            )}


            {/* Show image and OCR result only if image is uploaded */}
            {imageUrl && (
                <div className="content-container">
                    <div className="left-section">
                        {/* Display the uploaded image */}
                        <img
                            src={imageUrl}
                            alt="Prescription"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                    {/* Arrow */}
                    <div className="arrow">
                        <span style={{ fontSize: '100px', color: 'black' }}>→</span>
                    </div>

                    {/* OCR Result */}
                    <div className="right-section">
                        <div>
                            {getMatchedMedicines().length > 0 ? (
                                getMatchedMedicines().map((medicine, index) => (
                                    <button
                                        key={index}
                                        style={{
                                            margin: '10px',
                                            padding: '10px',
                                            background: '#005b7f',
                                            color: 'white',
                                            borderRadius: '5px',
                                        }}
                                        onClick={() => handleSelectText(medicine.name)}
                                    >
                                        {medicine.name}
                                    </button>
                                ))
                            ) : (
                                <p>No medicines found in the OCR text.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal open={isModalVisible} onClose={() => setIsModalVisible(false)} center>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>{selectedText}</h2>
                    <input
                        type="number"
                        placeholder="Input Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px', width: '100%', marginBottom: '20px' }}
                    />
                    <div>
                        <button
                            onClick={handleSaveQuantity}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                borderRadius: '5px',
                                marginRight: '10px',
                            }}
                        >
                            Find
                        </button>
                        <button
                            onClick={() => setIsModalVisible(false)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '5px',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>


            {/* FIND MEDICINE */}
            {isMedicineFound && (
                <div className="min-h-screen bg-gray-100">
                    <div className="text-primary-default p-6 flex items-center relative">
                        <h1 className="text-2xl font-bold mx-auto">{medicine[0].name} [{quantity}]</h1>
                    </div>

                    <div className="p-6 space-y-6">

                        <div>
                            <h2 className="text-lg font-semibold mb-4 text-center text-white bg-primary-variant p-4 rounded-lg">
                                Available Pharmacies
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {medicine.map((medication, index) => {
                                    const pharmacy = medication.pharmacy || {};
                                    const userInfo = pharmacy.userInfo || {};
                                    const location = pharmacy.location || {};

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white p-6 rounded-lg shadow-md space-y-4"
                                        >
                                            <h3 className="text-xl font-semibold text-center text-primary-variant">
                                                {userInfo.name || "Unknown Pharmacy"}
                                            </h3>

                                            <div className="flex items-center space-x-2">
                                                <IoLocationOutline size={20} className="text-gray-500" />
                                                <p className="text-gray-700">
                                                    {`${userInfo.street || ""}, ${userInfo.barangay || ""}, ${userInfo.city || ""}`
                                                        .replace(/(, )+/g, ", ")
                                                        .trim()}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <IoCallOutline size={20} className="text-gray-500" />
                                                <a
                                                    href={`tel:${userInfo.contactNumber || ""}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {userInfo.contactNumber || "N/A"}
                                                </a>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <IoCubeOutline size={20} className="text-gray-500" />
                                                <p className="text-green-600">{medication.stock} in stock</p>
                                                <p className="text-black italic">
                                                    (Last updated on {medication.timeStamps ? formatDateTime(new Date(medication.timeStamps)) : 'No Date Available'})</p>

                                            </div>

                                            <div className="w-full h-64 rounded-lg overflow-hidden">
                                                <MapContainer
                                                    center={[parseFloat(location.latitude) || 0, parseFloat(location.longitude) || 0]}
                                                    zoom={15}
                                                    style={{ height: "100%", width: "100%" }}
                                                >
                                                    <MapResize />
                                                    <TileLayer
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        attribution="&copy; OpenStreetMap contributors"
                                                    />
                                                    <Marker position={[parseFloat(location.latitude) || 0, parseFloat(location.longitude) || 0]}>
                                                        <Popup>{userInfo.name || "Pharmacy"}</Popup>
                                                    </Marker>
                                                </MapContainer>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PrescriptionUpload;

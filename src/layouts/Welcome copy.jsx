import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import PillsImage from "@assets/employee.png";
import PharmacistImage from "@assets/customer.png";
import CapsulesImage from "@assets/admin.png";
import { FaPills, FaMedkit, FaCapsules } from "react-icons/fa";
import axios from "axios"; // Ensure axios is installed and imported
import { API_URL } from "../env";

export default function WelcomePage() {
  const [categories, setCategories] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [PillsImage, PharmacistImage, CapsulesImage];
  
  useEffect(() => {
    // Fetch categories
    setCategories([
      { id: 1, name: "Pain Relievers" },
      { id: 2, name: "Vitamins" },
      { id: 3, name: "Antibiotics" },
    ]);

    // Fetch pharmacies
    setPharmacies([
      {
        id: 1,
        name: "Health First Pharmacy",
        location: "123 Main St, Cityville",
        contact: "123-456-7890",
        image: "https://via.placeholder.com/300x200?text=Pharmacy+1",
      },
      {
        id: 2,
        name: "Pharma Care",
        location: "456 Elm St, Townsville",
        contact: "987-654-3210",
        image: "https://via.placeholder.com/300x200?text=Pharmacy+2",
      },
    ]);

    // Fetch medications from the API
    axios
      .get(`${API_URL}medicine`)
      .then((response) => {
        // Filter unique medications by name
        const uniqueMedications = Array.from(
          new Map(response.data.map((med) => [med.name, med])).values()
        );
        setMedications(uniqueMedications);
      })
      .catch((error) =>
        console.error("Error fetching medications:", error)
      );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // Automatically switch every 3 seconds
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const handlePrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <section className="bg-blue-50 py-16 px-8">
      {/* Hero Section */}
      <div className="max-w-full mx-auto bg-blue-50 py-20 lg:py-15 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          {/* Text Section */}
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
            <h1 className="text-5xl font-extrabold text-primary-default mb-6">
              ePharmacy Locator
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Find the right medicines, nearby pharmacies, and explore health
              products with ease!
            </p>
            <a
              href="#shop"
              className="inline-block bg-primary-default text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Locate Now
            </a>
          </div>

          {/* Carousel Section */}
          <div className="lg:w-1/2 relative">
            <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
              <div
                className="flex transition-transform ease-out duration-500"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <img
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Arrows */}
              <button
                onClick={handlePrevious}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-600 focus:outline-none"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-600 focus:outline-none"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSlide ? "bg-primary-default" : "bg-gray-300"
                  } focus:outline-none`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medicines Section */}
      <div className="max-w-7xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-primary-default mb-8 text-center">
          Medicines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {medications.map((medication) => (
            <div key={medication.id} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">{medication.name}</h3>
              <p className="text-gray-600">{medication.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

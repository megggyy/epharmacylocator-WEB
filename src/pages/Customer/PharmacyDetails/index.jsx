import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import AuthGlobal from '../../../context/AuthGlobal';
import { API_URL } from '../../../env';
import { IoLocationOutline, IoCallOutline, IoTimeOutline } from "react-icons/io5";
import StarRating from '../../../assets/common/starRating';
import { Link, useLocation } from "react-router-dom";
import PulseSpinner from '../../../assets/common/spinner';

const PharmacyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicationData, setMedicationData] = useState([]);
  const [category, setCategory] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [updateFeedback, setUpdateFeedback] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(true);
  const [shareCustomerInfo, setShareCustomerInfo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop');
  const [search, setSearch] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const { state } = useContext(AuthGlobal);

  const MapResize = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
    }, [map]);
    return null;
  };

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}pharmacies/${id}`);
        setPharmacy(response.data);
      } catch (error) {
        console.error("Error fetching pharmacy details:", error);
      }
    };

    const fetchMedicineStocks = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine/features/${id}`);
        setMedicationData(response.data || []);
      } catch (error) {
        console.error("Error fetching medicine stocks:", error);
      }
    };

    const fetchCategoriesWithMedicines = async () => {
      try {
        const response = await axios.get(`${API_URL}medicine/features/${id}`);
        const stockData = response.data || [];
        const categoryMap = {};

        stockData.forEach((stockItem) => {
          const medicine = stockItem.medicine;
          if (medicine && Array.isArray(medicine.category)) {
            medicine.category.forEach((cat) => {
              if (cat.name) {
                categoryMap[cat.name] = (categoryMap[cat.name] || 0) + 1;
              }
            });
          }
        });

        const categoryList = Object.keys(categoryMap).map((categoryName) => ({
          name: categoryName,
          count: categoryMap[categoryName],
        }));

        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching medicine categories:', error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${API_URL}feedbacks/${id}`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    const fetchData = () => {
      Promise.all([
        fetchPharmacyDetails(),
        fetchMedicineStocks(),
        fetchCategoriesWithMedicines(),
        fetchFeedbacks(),
      ]).finally(() => setLoading(false));
    };
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (medicationData.length > 0) {
      const firstMedicine = medicationData[0].medicine;
      if (firstMedicine?.category) {
        const newCategory = Array.isArray(firstMedicine.category)
          ? firstMedicine.category.map((cat) => cat.name).join('/ ')
          : firstMedicine.category?.name || 'No Category';

        setCategory(newCategory);
      }
    }
  }, [medicationData]);

  useEffect(() => {
    const fetchCustomerFeedbacks = async () => {
      if (!state.user?.userId) {
        setShowReviewForm(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}feedbacks/customer/${state.user.userId}`);

        if (response.data?.exists) {
          setShowReviewForm(false);
        } else {
          setShowReviewForm(true);
        }
      } catch (error) {
        console.error("Error fetching customer feedback:", error?.response?.data || error.message);
      }
    };
    fetchCustomerFeedbacks();
  }, [state.user?.userId]);

  const handleCategoryClick = (category) => {
    if (!id) {
      console.error("Pharmacy ID is missing!");
      return;
    }

    if (!category?.name) {
      console.error("Category name is missing!");
      return;
    }

    const route = `/filter-medicines?category=${encodeURIComponent(category.name)}&pharmacyId=${id}`;
    navigate(route);
  };

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredMedicines(medicationData);
      setCategories(categories);
      console.log("No search term. Showing all medicines and categories.");
    } else {
      const filteredMeds = medicationData.filter((medication) =>
        medication.medicine?.brandName?.toLowerCase().includes(search.toLowerCase()) ||
        medication.medicine?.genericName?.toLowerCase().includes(search.toLowerCase())
      );
      console.log("Filtered medicines: ", filteredMeds);
  
      setFilteredMedicines(filteredMeds);
  
      const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
      );
      console.log("Filtered categories: ", filteredCategories);
      setCategories(filteredCategories); // Keep this separate from filteredMedicines
    }
  }, [search, medicationData, categories]);
   
  
  

  const addReview = (pharmacyId) => {
    const reviewData = {
      customer: state.user.userId,
      comment: comment,
      rating: rating, // Make sure rating is updated correctly
      pharmacy: pharmacyId,
      name: shareCustomerInfo,
    };
  
    axios.post(`${API_URL}feedbacks/create`, reviewData)
      .then(() => {
        toast.success('Review Added');
        setRating(0);  // Reset rating after submitting
        setComment('');
        setShowReviewForm(false);
      })
      .catch(() => {
        toast.error('Error! Please try again');
      });
  };
  

  const updateReviewForm = async (feedbackId) => {
    try {
      const response = await axios.get(`${API_URL}feedbacks/updateFetch/${feedbackId}`);
      setUpdateFeedback(response.data);
      setRating(response.data.rating);
      setComment(response.data.comment);
      setShareCustomerInfo(response.data.name);
      setEditingReview(true);
      setShowReviewForm(true);
    } catch (error) {
      console.error("Error fetching review for update:", error);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const response = await axios.delete(`${API_URL}feedbacks/delete/${reviewId}`);
      if (response.status === 200) {
        toast.success("Review deleted");
        setShowReviewForm(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete review");
    }
  };

  const updateReview = async () => {
    const updatedData = {
      rating: rating,
      comment: comment,
      name: shareCustomerInfo,
    };
    try {
      await axios.put(`${API_URL}feedbacks/update/${updateFeedback._id}`, updatedData);
      toast.success("Review updated");

      setShowReviewForm(false);
      setEditingReview(null);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl text-blue-600 font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-500 font-medium">Failed to load pharmacy details.</div>
      </div>
    );
  }

  const { latitude, longitude } = pharmacy.location;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-primary-default text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{pharmacy.userInfo.name}</h1>
      <div className="flex items-center space-x-3">
        <input
          type="text"
          placeholder="Search"
          className="p-2 rounded-lg border border-gray-300 w-full text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>


      {/* Tabs */}
      <div className="mb-8 flex justify-center gap-3 flex-wrap">
        {["shop", "products", "categories", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-5 py-2.5 rounded-full transition-all duration-200 font-semibold tracking-wide ${
              activeTab === tab
                ? "bg-primary-default text-white shadow-md"
                : "bg-white text-primary-default border border-primary-default hover:bg-primary-default hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "shop" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-md">
          {/* Left: Info */}
          <div className="flex flex-col items-center md:items-start">
            <img
              src={pharmacy?.images?.[0] || "https://via.placeholder.com/300"}
              alt={pharmacy.userInfo.name}
              className="w-64 h-64 object-cover rounded-xl mb-6 shadow-md"
            />
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Location & Contact</h2>
              <div className="flex items-center mb-3 text-gray-600">
                <IoLocationOutline size={22} className="text-primary-default" />
                <span className="ml-2">
                  {`${pharmacy.userInfo.street || ""}, ${pharmacy.userInfo.barangay || ""}, ${pharmacy.userInfo.city || ""}`.replace(/(, )+/g, ", ").trim()}
                </span>
              </div>
              <div className="flex items-center mb-3 text-gray-600">
                <IoCallOutline size={22} className="text-primary-default" />
                <span className="ml-2">{pharmacy.userInfo.contactNumber}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <IoTimeOutline size={22} className="text-primary-default" />
                <span className="ml-2">
                  {`${pharmacy.businessDays} (${pharmacy?.openingHour || "N/A"} - ${pharmacy?.closingHour || "N/A"})`}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center md:text-left">
              Location on Map
            </h2>
            <div className="w-full h-96 bg-gray-300 rounded-xl overflow-hidden shadow-md">
              <MapContainer center={[latitude, longitude]} zoom={16} style={{ height: "100%", width: "100%" }}>
                <MapResize />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latitude, longitude]}>
                  <Popup>{pharmacy.userInfo.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {activeTab === "products" && (
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Products</h2>
          {filteredMedicines?.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.map((medication) => {
                const medDetails = medication.medicine || {};
                const categoryNames = medDetails.category
                  ? medDetails.category.map((cat) => cat.name).join(" / ")
                  : "No Category";
                const totalStock =
                  medication.expirationPerStock?.reduce(
                    (sum, stockItem) => sum + stockItem.stock,
                    0
                  ) || 0;

                return (
                  <li
                    key={medication._id}
                    className="bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-200 transition"
                  >
                    <Link
                      to={`/customer/viewpharmacymedicine?id=${medication._id}&pharmacyId=${id}`}
                      state={{ from: location }}
                      className="block"
                    >
                      {/* Medicine Name & Stock */}
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-primary-default">
                          {medDetails.brandName ||
                            medDetails.genericName ||
                            "Unknown Medicine"}
                        </h3>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            totalStock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {totalStock > 0 ? `${totalStock} in stock` : "Out of Stock"}
                        </span>
                      </div>

                      {/* Generic Name */}
                      <p className="text-sm text-gray-600">
                        {medDetails.genericName || "No Generic Name"}
                      </p>

                      {/* Medicine Details */}
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>
                          💊 <strong>Dosage:</strong> {medDetails.dosageStrength || "N/A"}
                        </p>
                        <p>
                          📌 <strong>Form:</strong> {medDetails.dosageForm || "N/A"}
                        </p>
                        <p>
                          📂 <strong>Classification:</strong> {medDetails.classification || "N/A"}
                        </p>
                        <p>
                          📋 <strong>Category:</strong> {categoryNames}
                        </p>
                      </div>

                      {/* Last Updated */}
                      <p className="text-xs text-gray-400 mt-2">
                        (Stock updated on{" "}
                        {medication.timeStamps
                          ? new Date(medication.timeStamps).toLocaleString()
                          : "No Date"}
                        )
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-600">No medicines available.</p>
          )}
        </div>
      )}

      {/* Categories */}
      {activeTab === "categories" && (
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Categories</h2>
        {categories?.length > 0 ? (
  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {categories.map((category) => (
      <li
        key={category.name}
        onClick={() => handleCategoryClick(category)}
        className="bg-primary-light p-4 rounded-xl text-primary-dark font-medium shadow cursor-pointer hover:bg-primary-default hover:text-white transition-all duration-200"
      >
        {category.name} ({category.count})
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-600">No categories available.</p>
)}

      </div>
    )}


      {/* Reviews */}
      {activeTab === "reviews" && (
  <div className="bg-white p-8 rounded-2xl shadow-md">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reviews</h2>

    {feedbacks?.length > 0 ? (
  <ul className="space-y-6">
    {feedbacks.map((feedback) => (
      <li key={feedback._id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-primary-default">
            {feedback.name ? feedback.customer?.name : "Anonymous"}
          </div>
          <StarRating rating={feedback.rating} editable={false} />
        </div>
        <p className="text-gray-700">{feedback.comment}</p>
        {feedback.customer?._id === state.user?.userId && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => updateReviewForm(feedback._id)}
              className="text-blue-600 hover:underline text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => deleteReview(feedback._id)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-600">No reviews yet.</p>
)}


{/* Display Add Review Button only if the user hasn't reviewed */}
  {!feedbacks.some((feedback) => feedback.customer?._id === state.user?.userId) && !showReviewForm && (
  <button
    onClick={() => setShowReviewForm(true)}
    className="mt-6 bg-primary-default text-white px-4 py-2 rounded-md hover:bg-primary-dark"
  >
    Add Review
  </button>
)}


    {/* Review Form */}
    {showReviewForm && (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {editingReview ? "Update Your Review" : "Leave a Review"}
        </h3>

        <div className="mb-2">
          <StarRating rating={rating} setRating={setRating} editable />
        </div>

        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-2"
          rows="4"
          placeholder="Write your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={shareCustomerInfo}
            onChange={() => {
              setShareCustomerInfo(!shareCustomerInfo);
            }}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-600">Display my name</label>
        </div>

        <p className="text-gray-700 mb-2">
          Posting as:{" "}
          <span className="font-semibold">
            {shareCustomerInfo ? (state.user?.name || "Anonymous") : "Anonymous"}
          </span>
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => (editingReview ? updateReview() : addReview(pharmacy._id))}
            className="bg-primary-default text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            {editingReview ? "Update Review" : "Submit Review"}
          </button>
          <button
            onClick={() => {
              setShowReviewForm(false);
              setEditingReview(false);
              setComment("");
              setRating(0);
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
)}


    </div>
  );
};

export default PharmacyDetails;

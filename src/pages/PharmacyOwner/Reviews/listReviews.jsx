import React, { useState, useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as solidStar,
  faStarHalfAlt,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

import { API_URL } from "../../../env";
import PulseSpinner from "../../../assets/common/spinner";
import AuthGlobal from "@/context/AuthGlobal";

const ListReviewsScreen = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const { state } = useContext(AuthGlobal);

    const fetchFeedbacks = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}feedbacks/pharmacy/${state.user.userId}`);
            setFeedbacks(response.data);
            calculateAverageRating(response.data);
            setFilteredFeedbacks(response.data);
        } catch (error) {
            console.error("Error fetching feedback details:", error);
        } finally {
            setLoading(false);
        }
    }, [state.user.userId]);

    useEffect(() => {
        fetchFeedbacks();
        const interval = setInterval(fetchFeedbacks, 5000);
        return () => clearInterval(interval);
    }, [fetchFeedbacks]);

    const calculateAverageRating = (reviews) => {
        if (reviews.length === 0) {
            setAverageRating(0);
            return;
        }
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating((total / reviews.length).toFixed(1));
    };

    const filterByStars = (stars) => {
        setSelectedFilter(stars);
        setFilteredFeedbacks(stars === null ? feedbacks : feedbacks.filter((review) => review.rating === stars));
    };

    const renderStars = (rating) => (
        [...Array(5)].map((_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={i < rating ? solidStar : regularStar}
                size="lg"
                className={i < rating ? "text-yellow-500" : "text-gray-400"}
            />
        ))
    );


    return (
        <div className="bg-gray-100 min-h-screen p-6">
            {loading ? (
                <PulseSpinner />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => navigate(-1)} className="text-xl text-gray-700">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <h1 className="text-2xl font-bold">Reviews</h1>
                    </div>

                    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <span className="text-lg font-bold">Average Rating:</span>
                            <span className="text-xl font-bold text-blue-700">{averageRating}</span>
                            <div className="flex">{renderStars(Math.round(averageRating))}</div>
                        </div>

                        <div className="flex justify-center gap-2 mb-6">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <button
                                    key={star}
                                    className={`px-3 py-1 rounded ${selectedFilter === star ? "bg-blue-700 text-white" : "bg-gray-300"}`}
                                    onClick={() => filterByStars(selectedFilter === star ? null : star)}
                                >
                                    {star} ⭐
                                </button>
                            ))}
                        </div>

                        {filteredFeedbacks.length > 0 ? (
                            filteredFeedbacks.map((feedback) => (
                                <div key={feedback._id} className="bg-gray-100 p-4 mb-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold">{feedback.customer?.name || "Anonymous"}</span>
                                        <div className="flex">{renderStars(feedback.rating)}</div>
                                    </div>
                                    {feedback.comment && <p className="text-gray-600 mt-2 italic">{feedback.comment}</p>}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600">No reviews available</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ListReviewsScreen;

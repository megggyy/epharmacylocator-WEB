// ListReviews.jsx - Web version of your React Native ListReviewsScreen
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthGlobal from '@/context/AuthGlobal';
import PulseSpinner from '../../../assets/common/spinner';
import { API_URL } from '../../../env';
import { FaStar, FaRegStar } from 'react-icons/fa';

const ListReviews = () => {
  const navigate = useNavigate();
  const { state } = useContext(AuthGlobal);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [comment, setComment] = useState('');
  const [replyExists, setReplyExists] = useState(false);
  const [existingReply, setExistingReply] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}feedbacks/pharmacy/${state.user.userId}`);
      setFeedbacks(res.data);
      setFilteredFeedbacks(res.data);
      calculateAverageRating(res.data);
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
    } finally {
      setLoading(false);
    }
  }, [state.user.userId]);

  useEffect(() => {
    if (state.user?.role === 'PharmacyOwner') {
      fetchFeedbacks();
    }
  }, [fetchFeedbacks, state.user?.role]);

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return setAverageRating(0);
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    setAverageRating((total / reviews.length).toFixed(1));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-gray-400" />
    );
  };

  const filterByStars = (stars) => {
    setSelectedFilter(stars);
    if (stars === null) setFilteredFeedbacks(feedbacks);
    else setFilteredFeedbacks(feedbacks.filter((r) => r.rating === stars));
  };

  const openModal = async (review) => {
    setSelectedReview(review);
    setModalVisible(true);
    setComment('');
    setReplyExists(false);
    setExistingReply(null);

    try {
      const res = await axios.get(`${API_URL}feedbacks/checkReply/${review._id}`);
      if (res.data.exists) {
        setReplyExists(true);
        setExistingReply(res.data.feedbacks[0]);
      }
    } catch (err) {
      console.error('Failed to check reply:', err);
      alert('Failed to check reply.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReview(null);
    setComment('');
    setReplyExists(false);
    setExistingReply(null);
    setIsEditing(false);
  };

  const handleCreate = async () => {
    if (!comment.trim()) return alert('Please enter a reply.');

    try {
      const payload = { comment };
      const config = { headers: { 'Content-Type': 'application/json' } };
      let response;

      if (replyExists) {
        response = await axios.put(`${API_URL}feedbacks/reply/${selectedReview._id}`, payload, config);
      } else {
        response = await axios.post(`${API_URL}feedbacks/reply/${selectedReview._id}`, payload, config);
      }

      if (response.status === 200 || response.status === 201) {
        alert(replyExists ? 'Updated successfully' : 'Replied successfully');
        closeModal();
      }
    } catch (err) {
      console.error('Error replying:', err);
      alert(err.response?.data?.message || 'Failed to reply');
    }
  };

  const handleEdit = () => {
    if (existingReply) {
      setComment(existingReply.comment);
      setIsEditing(true);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this reply?');
    if (!confirm) return;
    try {
      const res = await axios.delete(`${API_URL}feedbacks/reply-delete/${id}`);
      if (res.status === 200) {
        alert('Deleted successfully');
        closeModal();
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {loading ? (
        <PulseSpinner />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/pharmacy')}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <h2 className="text-xl font-bold">Average Rating: {averageRating}</h2>
            <div className="flex gap-1">{renderStars(Math.round(averageRating))}</div>
          </div>

          <div className="flex gap-2 mb-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className={`border px-3 py-1 rounded ${selectedFilter === star ? 'bg-blue-500 text-white' : 'bg-white'}`}
                onClick={() => filterByStars(selectedFilter === star ? null : star)}
              >
                {star} ⭐
              </button>
            ))}
          </div>

          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((review) => (
              <div
                key={review._id}
                className="border p-4 mb-4 rounded shadow hover:bg-gray-50 cursor-pointer"
                onClick={() => openModal(review)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold">{review.customer?.name || 'Anonymous'}</h4>
                  <div className="flex gap-1">{renderStars(review.rating)}</div>
                </div>
                <p>{review.comment}</p>
                <small className="text-gray-500">
                  {new Date(review.timestamp).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p>No reviews available</p>
          )}
        </>
      )}

      {modalVisible && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">{selectedReview.customer?.name || 'Anonymous'}</h3>
            <div className="flex gap-1 mb-2">{renderStars(selectedReview.rating)}</div>
            <p className="mb-4">{selectedReview.comment}</p>

            {replyExists && !isEditing ? (
              <div className="mb-4">
                <p className="font-semibold">Your Reply:</p>
                <p className="border p-2 rounded bg-gray-100">{existingReply.comment}</p>
                <small className="text-gray-500">
                  {new Date(existingReply.timestamp).toLocaleString()}
                </small>
                <div className="flex gap-2 mt-2">
                  <button className="bg-yellow-400 px-3 py-1 rounded" onClick={handleEdit}>Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(existingReply._id)}>Delete</button>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your reply here..."
                ></textarea>
                <button
                  className="bg-green-600 text-white w-full py-2 rounded mb-2"
                  onClick={handleCreate}
                >
                  {replyExists ? 'Update Reply' : 'Submit Reply'}
                </button>
              </>
            )}

            <button
              className="w-full py-2 border rounded hover:bg-gray-100"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListReviews;
import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, editable }) => {
  const handleRatingClick = (newRating) => {
    if (editable) {
      setRating(newRating);
    }
  };

  return (
    <div className="flex justify-center items-center gap-2">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          onClick={() => handleRatingClick(index)}
          className={`text-xl ${rating >= index ? 'text-yellow-500' : ''} hover:scale-110 transition-transform`}
          //disabled={!editable}
        >
          {rating >= index ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
    </div>
  );
};


export default StarRating;


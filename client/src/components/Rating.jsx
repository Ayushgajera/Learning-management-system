
import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * Rating Component
 * @param {Number} rating - Current rating (0-5)
 * @param {Number} totalStars - Total stars to display (default 5)
 * @param {Function} onRate - Callback when user selects a rating (if interactive)
 * @param {Boolean} readOnly - If true, user cannot interact
 * @param {String} size - Size class for icons
 */
const Rating = ({ rating, totalStars = 5, onRate, readOnly = false, size = "text-yellow-400" }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index) => {
        if (!readOnly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index) => {
        if (!readOnly && onRate) {
            onRate(index);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            {[...Array(totalStars)].map((_, index) => {
                const starIndex = index + 1;
                // For display
                const isFull = (hoverRating || rating) >= starIndex;
                const isHalf = !isFull && (hoverRating || rating) >= starIndex - 0.5;

                return (
                    <span
                        key={index}
                        className={`cursor-pointer ${size} transition-transform hover:scale-110`}
                        onMouseEnter={() => handleMouseEnter(starIndex)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(starIndex)}
                    >
                        {isFull ? (
                            <FaStar />
                        ) : isHalf ? (
                            <FaStarHalfAlt />
                        ) : (
                            <FaRegStar className="text-gray-300" />
                        )}
                    </span>
                );
            })}
        </div>
    );
};

export default Rating;

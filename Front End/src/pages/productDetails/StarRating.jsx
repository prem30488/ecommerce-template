import React from 'react';

const StarRating = ({ rating, maxStars = 5 }) => {
    // Ensure rating is a number
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 !== 0;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            Rating :
            {/* Full stars */}
            {Array.from({ length: fullStars }, (_, i) => (
                <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
            ))}

            {/* Half star */}
            {hasHalfStar && (
                <span className="text-yellow-400 text-lg relative">
                    <span className="absolute inset-0 text-gray-300">★</span>
                    <span className="absolute inset-0 overflow-hidden w-1/2 text-yellow-400">★</span>
                </span>
            )}

            {/* Empty stars */}
            {Array.from({ length: emptyStars }, (_, i) => (
                <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
            ))}

            <span className="text-rose-600 font-bold ml-2">{numericRating.toFixed(1)}</span>
        </div>
    );
};

export default StarRating;

/**
 * Calculates the ranking score for a course using a Fiverr-like algorithm.
 * 
 * Formula:
 * Score = (Average Rating * Rating Weight) + (Log10(Total Ratings) * Trust Weight)
 * 
 * Logic:
 * - Average Rating (1-5): The quality signal.
 * - Total Ratings: The confidence/trust signal. We use Log10 to dampen the effect of massive view counts 
 *   (e.g., 1000 reviews isn't 10x better than 100 reviews, maybe just 2x-3x).
 * - Future enhancement: Completion rate and recency can be added here.
 * 
 * @param {Object} course - The course document with averageRating and totalRatings
 * @returns {Number} - The calculated ranking score
 */
export const calculateRankingScore = (course) => {
    const avgRating = course.averageRating || 0;
    const totalRatings = course.totalRatings || 0;

    // Weights (adjustable)
    const RATING_WEIGHT = 10;
    const TRUST_WEIGHT = 2;

    // Base score from rating (0 - 50)
    const ratingScore = avgRating * RATING_WEIGHT;

    // Trust score from volume (Logarithmic scale)
    // If totalRatings = 1, log10(1) = 0
    // If totalRatings = 10, log10(10) = 1
    // If totalRatings = 100, log10(100) = 2
    const trustScore = Math.log10(totalRatings + 1) * TRUST_WEIGHT;

    return ratingScore + trustScore;
};


/**
 * Format stats numbers according to specific display rules
 * @param {number} count - The actual count/number
 * @returns {string} - Formatted display string
 */
export const formatStatsNumber = (count) => {
  if (count < 10) {
    return count.toString();
  } else if (count >= 10 && count < 20) {
    return '10+';
  } else if (count >= 20 && count < 100) {
    return '20+';
  } else if (count >= 100 && count < 200) {
    return '100+';
  } else if (count >= 200 && count < 1000) {
    return '200+';
  } else if (count >= 1000 && count < 2000) {
    return '1k+';
  } else if (count >= 2000) {
    return '2k+';
  }
  return count.toString();
};


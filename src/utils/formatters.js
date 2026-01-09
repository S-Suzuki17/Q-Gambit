/**
 * Formatting Utilities
 */

/**
 * Format milliseconds to MM:SS
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTimeMs(ms) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

/**
 * Format seconds to MM:SS
 * @param {number|null|undefined} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTimeSeconds(seconds) {
  if (seconds === null || seconds === undefined) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

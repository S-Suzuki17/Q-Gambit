/**
 * Q-Gambit: Elo Rating System Utilities
 * Implements chess-like Elo rating calculations
 */

// Default starting rating
export const DEFAULT_RATING = 1500;

// K-factor determines how much ratings change per game
// Higher K = more volatile ratings
export const K_FACTOR = {
    NEW_PLAYER: 32,      // First 30 games
    ESTABLISHED: 24,     // 30-100 games
    EXPERIENCED: 16,     // 100+ games
};

// Rating range for matchmaking (expands over time)
export const MATCHMAKING_RANGES = [
    { waitTime: 0, range: 100 },      // Immediate: ±100
    { waitTime: 10000, range: 200 },  // 10s: ±200
    { waitTime: 30000, range: 400 },  // 30s: ±400
    { waitTime: 60000, range: 800 },  // 60s: ±800
    { waitTime: 90000, range: Infinity }, // 90s: anyone
];

/**
 * Calculate expected score based on rating difference
 * @param {number} myRating - Your rating
 * @param {number} opponentRating - Opponent's rating
 * @returns {number} Expected score (0-1)
 */
export function calculateExpectedScore(myRating, opponentRating) {
    return 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
}

/**
 * Calculate new rating after a game
 * @param {number} currentRating - Current rating
 * @param {number} opponentRating - Opponent's rating
 * @param {number} result - Game result (1 = win, 0 = loss, 0.5 = draw)
 * @param {number} gamesPlayed - Total games played (for K-factor)
 * @returns {{ newRating: number, change: number }}
 */
export function calculateNewRating(currentRating, opponentRating, result, gamesPlayed = 0) {
    // Determine K-factor based on experience
    let kFactor;
    if (gamesPlayed < 30) {
        kFactor = K_FACTOR.NEW_PLAYER;
    } else if (gamesPlayed < 100) {
        kFactor = K_FACTOR.ESTABLISHED;
    } else {
        kFactor = K_FACTOR.EXPERIENCED;
    }

    const expected = calculateExpectedScore(currentRating, opponentRating);
    const change = Math.round(kFactor * (result - expected));
    const newRating = Math.max(100, currentRating + change); // Minimum rating of 100

    return { newRating, change };
}

/**
 * Get the current matchmaking range based on wait time
 * @param {number} waitTimeMs - Time spent waiting in ms
 * @returns {number} Rating range (±)
 */
export function getMatchmakingRange(waitTimeMs) {
    for (let i = MATCHMAKING_RANGES.length - 1; i >= 0; i--) {
        if (waitTimeMs >= MATCHMAKING_RANGES[i].waitTime) {
            return MATCHMAKING_RANGES[i].range;
        }
    }
    return MATCHMAKING_RANGES[0].range;
}

/**
 * Check if two players are within matchable rating range
 * @param {number} rating1 - First player's rating
 * @param {number} rating2 - Second player's rating
 * @param {number} range - Acceptable rating difference
 * @returns {boolean}
 */
export function isWithinRange(rating1, rating2, range) {
    return Math.abs(rating1 - rating2) <= range;
}

/**
 * Get rating tier/rank name based on rating
 * @param {number} rating - Player rating
 * @returns {{ tier: string, name: string, nameJa: string }}
 */
export function getRatingTier(rating) {
    if (rating >= 2400) return { tier: 'grandmaster', name: 'Grandmaster', nameJa: 'グランドマスター' };
    if (rating >= 2200) return { tier: 'master', name: 'Master', nameJa: 'マスター' };
    if (rating >= 2000) return { tier: 'expert', name: 'Expert', nameJa: 'エキスパート' };
    if (rating >= 1800) return { tier: 'diamond', name: 'Diamond', nameJa: 'ダイヤモンド' };
    if (rating >= 1600) return { tier: 'platinum', name: 'Platinum', nameJa: 'プラチナ' };
    if (rating >= 1400) return { tier: 'gold', name: 'Gold', nameJa: 'ゴールド' };
    if (rating >= 1200) return { tier: 'silver', name: 'Silver', nameJa: 'シルバー' };
    if (rating >= 1000) return { tier: 'bronze', name: 'Bronze', nameJa: 'ブロンズ' };
    return { tier: 'beginner', name: 'Beginner', nameJa: '初心者' };
}

/**
 * Format rating change for display
 * @param {number} change - Rating change amount
 * @returns {string} Formatted string like "+12" or "-8"
 */
export function formatRatingChange(change) {
    return change >= 0 ? `+${change}` : `${change}`;
}

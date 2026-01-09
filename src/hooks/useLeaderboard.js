/**
 * useLeaderboard Hook - Top 10 Player Ranking
 * Fetches and caches top players from Firestore
 */
import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getRatingTier } from '../utils/rating';

const LEADERBOARD_CACHE_KEY = 'qgambit_leaderboard';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    // Load from cache first
    useEffect(() => {
        try {
            const cached = localStorage.getItem(LEADERBOARD_CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setLeaderboard(data);
                    setLastFetched(timestamp);
                    setLoading(false);
                    return;
                }
            }
        } catch (e) {
            console.warn('[Leaderboard] Cache read error:', e);
        }

        // Fetch fresh data
        fetchLeaderboard();
    }, []);

    // Fetch leaderboard from Firestore
    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Check if Firebase is configured
        if (!isFirebaseConfigured || !db) {
            // Return mock data for development
            const mockData = generateMockLeaderboard();
            setLeaderboard(mockData);
            setLoading(false);
            // console.log('[Leaderboard] Using mock data (Firebase not configured)');
            return;
        }

        try {
            const profilesRef = collection(db, 'artifacts', appId, 'public', 'data', 'profiles');
            const q = query(
                profilesRef,
                orderBy('rating', 'desc'),
                limit(10)
            );

            const snapshot = await getDocs(q);
            const players = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                players.push({
                    id: doc.id,
                    rank: players.length + 1,
                    rating: data.rating || 1500,
                    gamesPlayed: data.gamesPlayed || 0,
                    wins: data.wins || 0,
                    losses: data.losses || 0,
                    winRate: data.gamesPlayed > 0
                        ? Math.round((data.wins / data.gamesPlayed) * 100)
                        : 0,
                    // Generate display name from UID (first 8 chars)
                    displayName: data.displayName || `Player_${doc.id.slice(0, 6).toUpperCase()}`,
                    tier: getRatingTier(data.rating || 1500)
                });
            });

            setLeaderboard(players);
            setLastFetched(Date.now());

            // Cache results
            localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify({
                data: players,
                timestamp: Date.now(),
            }));

            // console.log('[Leaderboard] Fetched', players.length, 'players');
        } catch (e) {
            console.error('[Leaderboard] Fetch error:', e);
            setError(e.message);

            // Fallback to mock data on error
            const mockData = generateMockLeaderboard();
            setLeaderboard(mockData);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh leaderboard
    const refresh = useCallback(() => {
        localStorage.removeItem(LEADERBOARD_CACHE_KEY);
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return {
        leaderboard,
        loading,
        error,
        lastFetched,
        refresh,
    };
}

// Generate mock leaderboard for development/offline mode
function generateMockLeaderboard() {
    const names = [
        'QuantumKing', 'NeonBishop', 'CyberPawn', 'ShadowRook',
        'VoidKnight', 'NovaQueen', 'PlasmaWizard', 'ZenMaster',
        'CosmicPlayer', 'StardustHero'
    ];

    return names.map((name, i) => ({
        id: `mock_${i}`,
        rank: i + 1,
        displayName: name,
        rating: 2000 - (i * 50) + Math.floor(Math.random() * 30),
        gamesPlayed: 100 - (i * 5) + Math.floor(Math.random() * 20),
        wins: 60 - (i * 3) + Math.floor(Math.random() * 10),
        losses: 30 + (i * 2) + Math.floor(Math.random() * 5),
        winRate: Math.max(40, 70 - (i * 3) + Math.floor(Math.random() * 5)),
        tier: getRatingTier(2000 - (i * 50) + Math.floor(Math.random() * 30))
    }));
}

/**
 * useDetailedStats Hook - Advanced Player Statistics
 * Tracks first/second player winrates, time-based stats, etc.
 */
import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'qgambit_detailed_stats';

const DEFAULT_STATS = {
    asWhite: { wins: 0, losses: 0, draws: 0 },
    asBlack: { wins: 0, losses: 0, draws: 0 },
    byHour: {}, // Hour of day -> { wins, losses }
    longestWinStreak: 0,
    currentWinStreak: 0,
    totalPlayTime: 0, // in seconds
    fastestWin: null, // in seconds
    averageGameDuration: 0,
    gamesThisWeek: 0,
    lastPlayedAt: null,
};

export function useDetailedStats(user) {
    const [stats, setStats] = useState(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);

    // Load stats
    useEffect(() => {
        if (!user) {
            setStats(DEFAULT_STATS);
            setLoading(false);
            return;
        }

        const loadStats = async () => {
            setLoading(true);

            if (isFirebaseConfigured && db) {
                try {
                    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'detailedStats', user.uid);
                    const snap = await getDoc(statsRef);
                    if (snap.exists()) {
                        setStats({ ...DEFAULT_STATS, ...snap.data() });
                    }
                } catch (e) {
                    console.error('[DetailedStats] Load error:', e);
                    loadFromLocal();
                }
            } else {
                loadFromLocal();
            }

            setLoading(false);
        };

        const loadFromLocal = () => {
            try {
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (saved) {
                    setStats({ ...DEFAULT_STATS, ...JSON.parse(saved) });
                }
            } catch (e) { }
        };

        loadStats();
    }, [user]);

    // Record a game result
    const recordGame = useCallback(async (result) => {
        if (!user) return;

        const { myColor, outcome, duration } = result;
        // outcome: 'win', 'loss', 'draw'

        setStats(prev => {
            const newStats = { ...prev };
            const hour = new Date().getHours();

            // Update color-based stats
            if (myColor === 'white') {
                newStats.asWhite = { ...prev.asWhite };
                if (outcome === 'win') newStats.asWhite.wins++;
                else if (outcome === 'loss') newStats.asWhite.losses++;
                else newStats.asWhite.draws++;
            } else {
                newStats.asBlack = { ...prev.asBlack };
                if (outcome === 'win') newStats.asBlack.wins++;
                else if (outcome === 'loss') newStats.asBlack.losses++;
                else newStats.asBlack.draws++;
            }

            // Update hourly stats
            newStats.byHour = { ...prev.byHour };
            if (!newStats.byHour[hour]) {
                newStats.byHour[hour] = { wins: 0, losses: 0 };
            }
            if (outcome === 'win') newStats.byHour[hour].wins++;
            else if (outcome === 'loss') newStats.byHour[hour].losses++;

            // Update streaks
            if (outcome === 'win') {
                newStats.currentWinStreak = prev.currentWinStreak + 1;
                newStats.longestWinStreak = Math.max(newStats.longestWinStreak, newStats.currentWinStreak);
            } else {
                newStats.currentWinStreak = 0;
            }

            // Update duration stats
            if (duration) {
                newStats.totalPlayTime = prev.totalPlayTime + duration;
                if (outcome === 'win' && (!prev.fastestWin || duration < prev.fastestWin)) {
                    newStats.fastestWin = duration;
                }
                const totalGames = (newStats.asWhite.wins + newStats.asWhite.losses + newStats.asWhite.draws +
                    newStats.asBlack.wins + newStats.asBlack.losses + newStats.asBlack.draws);
                newStats.averageGameDuration = Math.round(newStats.totalPlayTime / totalGames);
            }

            // Update weekly counter
            newStats.gamesThisWeek = prev.gamesThisWeek + 1;
            newStats.lastPlayedAt = new Date().toISOString();

            return newStats;
        });
    }, [user]);

    // Save stats
    const saveStats = useCallback(async () => {
        if (!user) return;

        if (isFirebaseConfigured && db) {
            try {
                const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'detailedStats', user.uid);
                await setDoc(statsRef, stats, { merge: true });
            } catch (e) {
                console.error('[DetailedStats] Save error:', e);
            }
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
    }, [user, stats]);

    // Auto-save when stats change
    useEffect(() => {
        if (user && !loading) {
            saveStats();
        }
    }, [stats, user, loading, saveStats]);

    // Calculate derived stats
    const getWhiteWinRate = () => {
        const total = stats.asWhite.wins + stats.asWhite.losses + stats.asWhite.draws;
        return total > 0 ? Math.round((stats.asWhite.wins / total) * 100) : 0;
    };

    const getBlackWinRate = () => {
        const total = stats.asBlack.wins + stats.asBlack.losses + stats.asBlack.draws;
        return total > 0 ? Math.round((stats.asBlack.wins / total) * 100) : 0;
    };

    const getBestHour = () => {
        let bestHour = null;
        let bestWinRate = 0;

        for (const [hour, data] of Object.entries(stats.byHour)) {
            const total = data.wins + data.losses;
            if (total >= 3) { // Minimum 3 games
                const winRate = data.wins / total;
                if (winRate > bestWinRate) {
                    bestWinRate = winRate;
                    bestHour = parseInt(hour);
                }
            }
        }

        return bestHour;
    };

    return {
        stats,
        loading,
        recordGame,
        getWhiteWinRate,
        getBlackWinRate,
        getBestHour,
    };
}

/**
 * useDailyPlayLimit Hook - Daily Play Count Management
 * Limits free plays to 3 per day, stored in localStorage
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'qgambit_daily_limit';
const FREE_GAMES_PER_DAY = 3;

function getTodayString() {
    return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function loadDailyData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            // Reset if different day
            if (data.date === getTodayString()) {
                return data;
            }
        }
    } catch (e) {
        console.warn('[DailyLimit] Load error:', e);
    }
    return { date: getTodayString(), count: 0, bonusGames: 0 };
}

function saveDailyData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('[DailyLimit] Save error:', e);
    }
}

export function useDailyPlayLimit() {
    const [dailyData, setDailyData] = useState(loadDailyData);

    // Check for day change on mount and periodically
    useEffect(() => {
        const checkDayChange = () => {
            const today = getTodayString();
            if (dailyData.date !== today) {
                const newData = { date: today, count: 0, bonusGames: 0 };
                setDailyData(newData);
                saveDailyData(newData);
            }
        };

        checkDayChange();
        const interval = setInterval(checkDayChange, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [dailyData.date]);

    // Calculate remaining games
    // Total available = (Daily Free - Daily Used) + Persistent Tickets
    const dailyRemaining = Math.max(0, FREE_GAMES_PER_DAY - dailyData.count);
    const bonusTickets = dailyData.bonusTickets || 0;

    const canPlayFree = dailyRemaining > 0 || bonusTickets > 0;
    const remainingFreeGames = dailyRemaining; // Display daily separately? Or combine?
    // User requested "no-ad tickets", usually displayed separately or as "Total Free: X"
    // Let's expose both for UI flexibility

    // Increment play count
    const incrementPlayCount = useCallback(() => {
        setDailyData(prev => {
            const dailyLeft = Math.max(0, FREE_GAMES_PER_DAY - prev.count);

            let newData;
            if (dailyLeft > 0) {
                // Consume daily free game first
                newData = { ...prev, count: prev.count + 1 };
            } else if ((prev.bonusTickets || 0) > 0) {
                // Consume ticket
                newData = { ...prev, bonusTickets: prev.bonusTickets - 1 };
            } else {
                // Should be blocked by check, but just increment count to be safe/track attempts
                newData = { ...prev, count: prev.count + 1 };
            }

            saveDailyData(newData);
            return newData;
        });
    }, []);

    // Grant bonus game (ad watch or synthesis) - adds to persistent tickets
    const grantBonusGame = useCallback((amount = 1) => {
        setDailyData(prev => {
            const newData = { ...prev, bonusTickets: (prev.bonusTickets || 0) + amount };
            saveDailyData(newData);
            return newData;
        });
    }, []);

    return {
        canPlayFree,
        remainingFreeGames, // Daily remaining
        bonusTickets,       // Persistent tickets
        totalFreeAvailable: dailyRemaining + bonusTickets,
        freeGamesPerDay: FREE_GAMES_PER_DAY,
        incrementPlayCount,
        grantBonusGame,
    };
}

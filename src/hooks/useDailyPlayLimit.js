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

    // Calculate remaining free games
    const totalAllowed = FREE_GAMES_PER_DAY + dailyData.bonusGames;
    const remainingFreeGames = Math.max(0, totalAllowed - dailyData.count);
    const canPlayFree = remainingFreeGames > 0;

    // Increment play count when starting a game
    const incrementPlayCount = useCallback(() => {
        setDailyData(prev => {
            const newData = { ...prev, count: prev.count + 1 };
            saveDailyData(newData);
            return newData;
        });
    }, []);

    // Grant bonus game after watching ad
    const grantBonusGame = useCallback(() => {
        setDailyData(prev => {
            const newData = { ...prev, bonusGames: prev.bonusGames + 1 };
            saveDailyData(newData);
            return newData;
        });
    }, []);

    return {
        canPlayFree,
        remainingFreeGames,
        todayPlayCount: dailyData.count,
        freeGamesPerDay: FREE_GAMES_PER_DAY,
        incrementPlayCount,
        grantBonusGame,
    };
}

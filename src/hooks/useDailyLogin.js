import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
    LAST_LOGIN: 'q-gambit-last-login',
    STREAK: 'q-gambit-streak',
    HAS_CLAIMED_TODAY: 'q-gambit-claimed-today' // Optional: specifically for the bonus modal
};

export const useDailyLogin = () => {
    const [streak, setStreak] = useState(1);
    const [showLoginBonus, setShowLoginBonus] = useState(false);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = () => {
        const lastLoginStr = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
        const streakStr = localStorage.getItem(STORAGE_KEYS.STREAK);

        const now = new Date();
        const todayStr = now.toDateString(); // "Fri Jan 09 2026" - local timezone based

        let currentStreak = parseInt(streakStr || '0', 10);

        if (!lastLoginStr) {
            // First time ever
            currentStreak = 1;
            setShowLoginBonus(true);
        } else {
            if (lastLoginStr === todayStr) {
                // Already logged in today
                // Check if we claimed bonus? For now, we only show if we haven't 'seen' it this session?
                // Actually, standard practice is show once per day on first launch.
                // We'll rely on a separate flag or just session state if we want strictness.
                // For simplicity, we won't show it if the stored date is today.
                setShowLoginBonus(false);
                return;
            }

            const lastLoginDate = new Date(lastLoginStr);
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastLoginDate.toDateString() === yesterday.toDateString()) {
                // Logged in yesterday -> streak continues
                currentStreak += 1;
            } else {
                // Missed a day (or more) -> reset streak
                currentStreak = 1;
            }

            setShowLoginBonus(true);
        }

        setStreak(currentStreak);
    };

    const claimBonus = useCallback((onClaimSuccess) => {
        const now = new Date();
        const todayStr = now.toDateString();

        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, todayStr);
        localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());

        setShowLoginBonus(false);

        // Trigger external reward logic (e.g. add Piece)
        if (onClaimSuccess) {
            onClaimSuccess();
        }
    }, [streak]);

    return {
        streak,
        showLoginBonus,
        claimBonus
    };
};

/**
 * useAchievements Hook - Achievement System
 * Tracks and unlocks achievements based on player progress
 */
import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'qgambit_achievements';

// Achievement definitions
export const ACHIEVEMENTS = [
    {
        id: 'first_win',
        name: '初勝利',
        description: '初めての勝利を収める',
        icon: '🏆',
        condition: (stats) => stats.wins >= 1,
    },
    {
        id: 'ten_wins',
        name: '10勝達成',
        description: '10勝を達成する',
        icon: '⭐',
        condition: (stats) => stats.wins >= 10,
    },
    {
        id: 'fifty_wins',
        name: '50勝達成',
        description: '50勝を達成する',
        icon: '🌟',
        condition: (stats) => stats.wins >= 50,
    },
    {
        id: 'win_streak_3',
        name: '3連勝',
        description: '3連勝を達成する',
        icon: '🔥',
        condition: (stats) => stats.currentStreak >= 3,
    },
    {
        id: 'win_streak_5',
        name: '5連勝',
        description: '5連勝を達成する',
        icon: '💥',
        condition: (stats) => stats.currentStreak >= 5,
    },
    {
        id: 'win_streak_10',
        name: '10連勝',
        description: '10連勝を達成する',
        icon: '👑',
        condition: (stats) => stats.currentStreak >= 10,
    },
    {
        id: 'rating_1600',
        name: 'プラチナランク',
        description: 'レート1600に到達する',
        icon: '💎',
        condition: (stats) => stats.rating >= 1600,
    },
    {
        id: 'rating_1800',
        name: 'ダイヤモンドランク',
        description: 'レート1800に到達する',
        icon: '💠',
        condition: (stats) => stats.rating >= 1800,
    },
    {
        id: 'rating_2000',
        name: 'エキスパート',
        description: 'レート2000に到達する',
        icon: '🎯',
        condition: (stats) => stats.rating >= 2000,
    },
    {
        id: 'games_10',
        name: '10試合達成',
        description: '10試合をプレイする',
        icon: '🎮',
        condition: (stats) => stats.gamesPlayed >= 10,
    },
    {
        id: 'games_50',
        name: '50試合達成',
        description: '50試合をプレイする',
        icon: '🕹️',
        condition: (stats) => stats.gamesPlayed >= 50,
    },
    {
        id: 'games_100',
        name: '100試合達成',
        description: '100試合をプレイする',
        icon: '🏅',
        condition: (stats) => stats.gamesPlayed >= 100,
    },
];

export function useAchievements(user, profile) {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [newAchievement, setNewAchievement] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);

    // Load achievements
    useEffect(() => {
        if (!user) {
            setUnlockedAchievements([]);
            return;
        }

        const loadAchievements = async () => {
            if (isFirebaseConfigured && db) {
                try {
                    const achieveRef = doc(db, 'artifacts', appId, 'public', 'data', 'achievements', user.uid);
                    const snap = await getDoc(achieveRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        setUnlockedAchievements(data.unlocked || []);
                        setCurrentStreak(data.currentStreak || 0);
                    }
                } catch (e) {
                    console.error('[Achievements] Load error:', e);
                    loadFromLocal();
                }
            } else {
                loadFromLocal();
            }
        };

        const loadFromLocal = () => {
            try {
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    setUnlockedAchievements(data.unlocked || []);
                    setCurrentStreak(data.currentStreak || 0);
                }
            } catch (e) { }
        };

        loadAchievements();
    }, [user]);

    // Check for new achievements
    const checkAchievements = useCallback(async (stats) => {
        if (!user) return;

        const fullStats = { ...stats, currentStreak };
        const newlyUnlocked = [];

        for (const achievement of ACHIEVEMENTS) {
            if (!unlockedAchievements.includes(achievement.id)) {
                if (achievement.condition(fullStats)) {
                    newlyUnlocked.push(achievement.id);
                }
            }
        }

        if (newlyUnlocked.length > 0) {
            const updated = [...unlockedAchievements, ...newlyUnlocked];
            setUnlockedAchievements(updated);

            // Show notification for first new achievement
            const firstNew = ACHIEVEMENTS.find(a => a.id === newlyUnlocked[0]);
            setNewAchievement(firstNew);
            setTimeout(() => setNewAchievement(null), 4000);

            // Save
            if (isFirebaseConfigured && db) {
                try {
                    const achieveRef = doc(db, 'artifacts', appId, 'public', 'data', 'achievements', user.uid);
                    await setDoc(achieveRef, {
                        unlocked: updated,
                        currentStreak,
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                } catch (e) {
                    console.error('[Achievements] Save error:', e);
                }
            }

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
                unlocked: updated,
                currentStreak
            }));
        }

        return newlyUnlocked;
    }, [user, unlockedAchievements, currentStreak]);

    // Update win streak
    const updateStreak = useCallback(async (won) => {
        const newStreak = won ? currentStreak + 1 : 0;
        setCurrentStreak(newStreak);

        if (isFirebaseConfigured && db && user) {
            try {
                const achieveRef = doc(db, 'artifacts', appId, 'public', 'data', 'achievements', user.uid);
                await updateDoc(achieveRef, { currentStreak: newStreak });
            } catch (e) { }
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
            unlocked: unlockedAchievements,
            currentStreak: newStreak
        }));

        return newStreak;
    }, [user, currentStreak, unlockedAchievements]);

    // Get unlocked achievement objects
    const getUnlockedAchievements = useCallback(() => {
        return ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
    }, [unlockedAchievements]);

    return {
        achievements: ACHIEVEMENTS,
        unlockedAchievements,
        newAchievement,
        currentStreak,
        checkAchievements,
        updateStreak,
        getUnlockedAchievements,
        dismissNewAchievement: () => setNewAchievement(null),
    };
}

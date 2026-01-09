/**
 * useUserProfile Hook - User Profile with Rating Management
 * Stores and retrieves user rating from Firestore or localStorage
 */
import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DEFAULT_RATING, calculateNewRating, getRatingTier } from '../utils/rating';

const LOCAL_STORAGE_KEY = 'qgambit_user_profile';

const DEFAULT_RATINGS = {
    rapid: DEFAULT_RATING,
    blitz: DEFAULT_RATING,
    speed: DEFAULT_RATING,
};

export function useUserProfile(user) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load profile on user change
    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const loadProfile = async () => {
            setLoading(true);

            // Try Firestore first
            if (isFirebaseConfigured && db) {
                try {
                    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
                    const snap = await getDoc(profileRef);

                    if (snap.exists()) {
                        const data = snap.data();
                        // Migration: Ensure ratings object exists
                        if (!data.ratings) {
                            const updatedProfile = {
                                ...data,
                                ratings: {
                                    rapid: data.rating || DEFAULT_RATING,
                                    blitz: data.rating || DEFAULT_RATING,
                                    speed: data.rating || DEFAULT_RATING,
                                }
                            };
                            setProfile(updatedProfile);
                            await updateDoc(profileRef, { ratings: updatedProfile.ratings });
                        } else {
                            setProfile(data);
                        }
                    } else {
                        // Create new profile
                        const newProfile = {
                            documentId: user.uid,
                            rating: DEFAULT_RATING,
                            ratings: DEFAULT_RATINGS,
                            gamesPlayed: 0,
                            wins: 0,
                            losses: 0,
                            draws: 0,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        };
                        await setDoc(profileRef, newProfile);
                        setProfile({ ...newProfile, createdAt: new Date(), updatedAt: new Date() });
                    }
                } catch (e) {
                    console.error('[Profile] Firestore error, falling back to local:', e);
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
                    const parsed = JSON.parse(saved);
                    if (parsed.documentId === user.uid) {
                        setProfile(parsed);
                        return;
                    }
                }
            } catch (e) {
                console.warn('[Profile] localStorage error:', e);
            }

            // Create new local profile
            const newProfile = {
                documentId: user.uid,
                rating: DEFAULT_RATING,
                ratings: DEFAULT_RATINGS,
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
            setProfile(newProfile);
        };

        loadProfile();
    }, [user]);

    // Update rating after game
    const updateRating = useCallback(async (opponentRating, result, mode = 'rapid') => {
        if (!user || !profile) return null;

        const currentModeRating = profile.ratings?.[mode] || profile.rating || DEFAULT_RATING;

        const { newRating, change } = calculateNewRating(
            currentModeRating,
            opponentRating,
            result,
            profile.gamesPlayed
        );

        const newRatings = {
            ...profile.ratings,
            [mode]: newRating
        };

        const updates = {
            rating: mode === 'rapid' ? newRating : profile.rating, // Keep legacy rating synced with rapid
            ratings: newRatings,
            gamesPlayed: profile.gamesPlayed + 1,
            wins: profile.wins + (result === 1 ? 1 : 0),
            losses: profile.losses + (result === 0 ? 1 : 0),
            draws: profile.draws + (result === 0.5 ? 1 : 0),
            updatedAt: serverTimestamp(),
        };

        // Update Firestore
        if (isFirebaseConfigured && db) {
            try {
                const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
                await updateDoc(profileRef, updates);
            } catch (e) {
                console.error('[Profile] Update error:', e);
            }
        }

        // Update local state and storage
        const newProfile = { ...profile, ...updates, updatedAt: new Date().toISOString() };
        setProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));

        return { newRating, change };
    }, [user, profile]);

    // Get current tier
    const tier = profile ? getRatingTier(profile.rating) : null;

    return {
        profile,
        loading,
        rating: profile?.rating || DEFAULT_RATING,
        ratings: profile?.ratings || DEFAULT_RATINGS,
        tier,
        updateRating,
    };
}

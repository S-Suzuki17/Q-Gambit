/**
 * useMatchHistory Hook - Match History Management
 * Saves and retrieves match history from Firestore
 */
import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import {
    collection,
    doc,
    setDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'qgambit_match_history';
const MAX_HISTORY = 20;

export function useMatchHistory(user) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load history on mount
    useEffect(() => {
        if (!user) {
            setHistory([]);
            setLoading(false);
            return;
        }

        const loadHistory = async () => {
            setLoading(true);

            if (isFirebaseConfigured && db) {
                try {
                    const historyRef = collection(
                        db, 'artifacts', appId, 'public', 'data', 'matchHistory', user.uid, 'matches'
                    );
                    const q = query(historyRef, orderBy('playedAt', 'desc'), limit(MAX_HISTORY));
                    const snapshot = await getDocs(q);

                    const matches = [];
                    snapshot.forEach(doc => {
                        matches.push({ id: doc.id, ...doc.data() });
                    });

                    setHistory(matches);
                    console.log('[MatchHistory] Loaded', matches.length, 'matches');
                } catch (e) {
                    console.error('[MatchHistory] Load error:', e);
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
                    setHistory(parsed.filter(m => m.odokumentId === user.uid));
                }
            } catch (e) {
                console.warn('[MatchHistory] Local load error:', e);
            }
        };

        loadHistory();
    }, [user]);

    // Save a new match to history
    const saveMatch = useCallback(async (matchData) => {
        if (!user) return;

        const match = {
            odokumentId: user.uid,
            opponentName: matchData.opponentName || 'Unknown',
            opponentRating: matchData.opponentRating || 1500,
            result: matchData.result, // 'win', 'loss', 'draw'
            ratingChange: matchData.ratingChange || 0,
            newRating: matchData.newRating || 1500,
            playedAt: new Date().toISOString(),
            duration: matchData.duration || 0,
        };

        // Update local state immediately
        setHistory(prev => [match, ...prev].slice(0, MAX_HISTORY));

        // Save to Firestore
        if (isFirebaseConfigured && db) {
            try {
                const matchId = Date.now().toString();
                const matchRef = doc(
                    db, 'artifacts', appId, 'public', 'data', 'matchHistory', user.uid, 'matches', matchId
                );
                await setDoc(matchRef, {
                    ...match,
                    playedAt: serverTimestamp(),
                });
                console.log('[MatchHistory] Saved match:', matchId);
            } catch (e) {
                console.error('[MatchHistory] Save error:', e);
            }
        }

        // Save to localStorage as backup
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const existing = saved ? JSON.parse(saved) : [];
            const updated = [match, ...existing].slice(0, MAX_HISTORY);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.warn('[MatchHistory] Local save error:', e);
        }
    }, [user]);

    return {
        history,
        loading,
        saveMatch,
    };
}

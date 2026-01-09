/**
 * useGameRecord Hook - Game Record & Replay System
 * Saves full game moves for replay, auto-deletes after 90 days
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'qgambit_game_records';
const MAX_RECORDS = 20; // Keep only last 20 games
const RETENTION_DAYS = 90; // Delete after 90 days

export function useGameRecord(user) {
    const [records, setRecords] = useState([]);
    const [currentReplay, setCurrentReplay] = useState(null);
    const [replayIndex, setReplayIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const currentGameRef = useRef({ moves: [], startTime: null });

    // Load saved records
    useEffect(() => {
        if (!user) {
            setRecords([]);
            setLoading(false);
            return;
        }

        const loadRecords = async () => {
            setLoading(true);

            if (isFirebaseConfigured && db) {
                try {
                    const recordsRef = collection(
                        db, 'artifacts', appId, 'public', 'data', 'gameRecords', user.uid, 'games'
                    );
                    const q = query(recordsRef, orderBy('playedAt', 'desc'), limit(MAX_RECORDS));
                    const snapshot = await getDocs(q);

                    const loadedRecords = [];
                    snapshot.forEach(doc => {
                        loadedRecords.push({ id: doc.id, ...doc.data() });
                    });

                    setRecords(loadedRecords);

                    // Cleanup old records (90+ days)
                    await cleanupOldRecords(user.uid);

                } catch (e) {
                    console.error('[GameRecord] Load error:', e);
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
                    setRecords(parsed.filter(r => r.odokumentId === user.uid).slice(0, MAX_RECORDS));
                }
            } catch (e) { }
        };

        loadRecords();
    }, [user]);

    // Cleanup old records (90+ days old)
    const cleanupOldRecords = async (odokumentId) => {
        if (!isFirebaseConfigured || !db) return;

        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

            const recordsRef = collection(
                db, 'artifacts', appId, 'public', 'data', 'gameRecords', odokumentId, 'games'
            );
            const oldQuery = query(recordsRef, where('playedAt', '<', cutoffDate.toISOString()));
            const oldDocs = await getDocs(oldQuery);

            for (const docSnap of oldDocs.docs) {
                await deleteDoc(docSnap.ref);
            }

            if (oldDocs.size > 0) {
                console.log('[GameRecord] Cleaned up', oldDocs.size, 'old records');
            }
        } catch (e) {
            console.warn('[GameRecord] Cleanup error:', e);
        }
    };

    // Start recording a new game
    const startRecording = useCallback((roomId, myColor, opponentName) => {
        currentGameRef.current = {
            roomId,
            myColor,
            opponentName: opponentName || 'Unknown',
            moves: [],
            startTime: Date.now(),
        };
        console.log('[GameRecord] Started recording');
    }, []);

    // Record a move
    const recordMove = useCallback((move) => {
        currentGameRef.current.moves.push({
            ...move,
            timestamp: Date.now() - currentGameRef.current.startTime,
        });
    }, []);

    // Finish recording and save
    const finishRecording = useCallback(async (result, finalBoard, finalPieces) => {
        if (!user || currentGameRef.current.moves.length === 0) return null;

        const record = {
            odokumentId: user.uid,
            roomId: currentGameRef.current.roomId,
            myColor: currentGameRef.current.myColor,
            opponentName: currentGameRef.current.opponentName,
            result, // 'win', 'loss', 'draw'
            moves: currentGameRef.current.moves,
            moveCount: currentGameRef.current.moves.length,
            duration: Date.now() - currentGameRef.current.startTime,
            playedAt: new Date().toISOString(),
        };

        // Update local state
        setRecords(prev => [record, ...prev].slice(0, MAX_RECORDS));

        // Save to Firestore
        if (isFirebaseConfigured && db) {
            try {
                const recordId = Date.now().toString();
                const recordRef = doc(
                    db, 'artifacts', appId, 'public', 'data', 'gameRecords', user.uid, 'games', recordId
                );
                await setDoc(recordRef, {
                    ...record,
                    playedAt: serverTimestamp(),
                });
                console.log('[GameRecord] Saved record:', recordId);
            } catch (e) {
                console.error('[GameRecord] Save error:', e);
            }
        }

        // Save to localStorage backup
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const existing = saved ? JSON.parse(saved) : [];
            const updated = [record, ...existing].slice(0, MAX_RECORDS);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) { }

        // Reset current game
        currentGameRef.current = { moves: [], startTime: null };

        return record;
    }, [user]);

    // Start replay
    const startReplay = useCallback((record) => {
        setCurrentReplay(record);
        setReplayIndex(0);
    }, []);

    // Step through replay
    const replayNext = useCallback(() => {
        if (!currentReplay) return null;
        if (replayIndex >= currentReplay.moves.length) return null;

        const move = currentReplay.moves[replayIndex];
        setReplayIndex(prev => prev + 1);
        return move;
    }, [currentReplay, replayIndex]);

    const replayPrev = useCallback(() => {
        if (!currentReplay || replayIndex <= 0) return;
        setReplayIndex(prev => prev - 1);
    }, [currentReplay, replayIndex]);

    const stopReplay = useCallback(() => {
        setCurrentReplay(null);
        setReplayIndex(0);
    }, []);

    return {
        records,
        loading,
        currentReplay,
        replayIndex,
        startRecording,
        recordMove,
        finishRecording,
        startReplay,
        replayNext,
        replayPrev,
        stopReplay,
        maxRecords: MAX_RECORDS,
        retentionDays: RETENTION_DAYS,
    };
}

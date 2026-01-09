/**
 * useOnlineStatus Hook - Real-time Online Player Count
 * Uses Firestore to track online players
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    getDocs
} from 'firebase/firestore';

const PRESENCE_TIMEOUT = 60000; // 1 minute
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useOnlineStatus(user) {
    const [onlineCount, setOnlineCount] = useState(1);
    const [isOnline, setIsOnline] = useState(true);
    const heartbeatRef = useRef(null);
    const presenceRef = useRef(null);

    useEffect(() => {
        if (!user || !isFirebaseConfigured || !db) {
            setOnlineCount(1);
            return;
        }

        const presenceCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'presence');
        presenceRef.current = doc(presenceCollectionRef, user.uid);

        // Update presence
        const updatePresence = async () => {
            try {
                await setDoc(presenceRef.current, {
                    odokumentId: user.uid,
                    lastSeen: serverTimestamp(),
                    online: true,
                });
                setIsOnline(true);
            } catch (e) {
                console.warn('[Presence] Update error:', e);
            }
        };

        // Count online users
        const countOnlineUsers = async () => {
            try {
                const now = Date.now();
                const activeThreshold = new Date(now - PRESENCE_TIMEOUT);

                const snapshot = await getDocs(presenceCollectionRef);
                let count = 0;

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const lastSeen = data.lastSeen?.toDate?.() || new Date(0);
                    if (now - lastSeen.getTime() < PRESENCE_TIMEOUT) {
                        count++;
                    }
                });

                setOnlineCount(Math.max(1, count));
            } catch (e) {
                console.warn('[Presence] Count error:', e);
            }
        };

        // Initial update
        updatePresence();
        countOnlineUsers();

        // Heartbeat to keep presence alive
        heartbeatRef.current = setInterval(() => {
            updatePresence();
            countOnlineUsers();
        }, HEARTBEAT_INTERVAL);

        // Listen for presence changes 
        const unsubscribe = onSnapshot(presenceCollectionRef, () => {
            countOnlineUsers();
        }, (error) => {
            console.warn('[Presence] Listen error:', error);
        });

        // Cleanup on unmount
        return () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
            }
            unsubscribe();

            // Mark as offline
            if (presenceRef.current) {
                deleteDoc(presenceRef.current).catch(() => { });
            }
        };
    }, [user]);

    // Manual go offline
    const goOffline = useCallback(async () => {
        if (presenceRef.current) {
            try {
                await deleteDoc(presenceRef.current);
                setIsOnline(false);
            } catch (e) {
                console.warn('[Presence] Offline error:', e);
            }
        }
    }, []);

    return {
        onlineCount,
        isOnline,
        goOffline,
    };
}

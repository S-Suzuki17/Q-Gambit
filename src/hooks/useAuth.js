/**
 * useAuth Hook - Firebase Anonymous Authentication
 */
import { useState, useEffect, useCallback } from 'react';
import { auth, signInAnonymously, onAuthStateChanged, isFirebaseConfigured } from '../config/firebase';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        if (!isFirebaseConfigured) {
            // Mock user for offline mode
            const mockUser = {
                uid: 'local-' + Math.random().toString(36).substr(2, 9),
                isAnonymous: true,
                displayName: 'Observer',
            };
            if (isMounted) {
                setUser(mockUser);
                setLoading(false);
            }
            console.log('[Auth] Offline mode - using mock user:', mockUser.uid);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!isMounted) return;

            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(false);
                console.log('[Auth] User signed in:', firebaseUser.uid);
            } else {
                // Auto sign in anonymously
                signInAnonymously(auth)
                    .then((result) => {
                        if (isMounted) console.log('[Auth] Anonymous sign in successful:', result.user.uid);
                    })
                    .catch((err) => {
                        if (isMounted) {
                            console.error('[Auth] Sign in failed:', err);
                            setError(err.message);
                            setLoading(false);
                        }
                    });
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const signOut = useCallback(async () => {
        if (auth) {
            try {
                await auth.signOut();
                setUser(null);
            } catch (err) {
                setError(err.message);
            }
        }
    }, []);

    return { user, loading, error, signOut };
}

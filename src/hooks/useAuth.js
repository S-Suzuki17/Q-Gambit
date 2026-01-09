/**
 * useAuth Hook - Firebase Authentication with Google
 * Supports: Anonymous (Guest), Google Sign-In, Account Linking
 */
import { useState, useEffect, useCallback } from 'react';
import {
    auth,
    signInAnonymously,
    onAuthStateChanged,
    isFirebaseConfigured,
    googleProvider,
    signInWithPopup,
    GoogleAuthProvider
} from '../config/firebase';
import { linkWithPopup } from 'firebase/auth';

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
                displayName: 'Guest',
                photoURL: null,
            };
            if (isMounted) {
                setUser(mockUser);
                setLoading(false);
            }
            // console.log('[Auth] Offline mode - using mock user:', mockUser.uid);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!isMounted) return;

            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(false);
                // console.log('[Auth] User signed in:', firebaseUser.uid);
            } else {
                // Auto sign in anonymously (Guest mode)
                signInAnonymously(auth)
                    .then((result) => {
                        if (isMounted) console.log('[Auth] Guest sign in successful:', result.user.uid);
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

    // Sign in with Google (new user or returning user)
    const signInWithGoogle = useCallback(async () => {
        if (!isFirebaseConfigured || !googleProvider) {
            console.warn('[Auth] Google sign-in not available in offline mode');
            return { success: false, error: 'Offline mode' };
        }

        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('[Auth] Google sign in successful:', result.user.displayName);
            return { success: true, user: result.user };
        } catch (err) {
            console.error('[Auth] Google sign in failed:', err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    // Link anonymous account to Google (preserves data)
    const linkWithGoogle = useCallback(async () => {
        if (!isFirebaseConfigured || !googleProvider || !auth.currentUser) {
            console.warn('[Auth] Account linking not available');
            return { success: false, error: 'Not available' };
        }

        if (!auth.currentUser.isAnonymous) {
            console.warn('[Auth] User is already linked to a permanent account');
            return { success: false, error: 'Already linked' };
        }

        try {
            const result = await linkWithPopup(auth.currentUser, googleProvider);
            console.log('[Auth] Account linked to Google:', result.user.displayName);
            setUser(result.user); // Update user state
            return { success: true, user: result.user };
        } catch (err) {
            // Handle "account already exists" error
            if (err.code === 'auth/credential-already-in-use') {
                console.warn('[Auth] Google account already exists. Signing in instead.');
                // Could attempt to sign in with the existing account...
                // For now, just return error
                return { success: false, error: 'このGoogleアカウントは既に登録されています。', code: err.code };
            }
            console.error('[Auth] Account linking failed:', err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    // Sign out
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

    return {
        user,
        loading,
        error,
        signOut,
        signInWithGoogle,
        linkWithGoogle,
        isAnonymous: user?.isAnonymous ?? true,
        isLoggedIn: !!user && !user.isAnonymous,
    };
}

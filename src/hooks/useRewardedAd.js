/**
 * useRewardedAd Hook - Rewarded Ad Management
 * Uses AdMob in production, mock ads in development
 */
import { useState, useCallback, useEffect } from 'react';

// Check if we're in a Capacitor native environment
const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();

// Mock delay for development
const MOCK_AD_DELAY = 3000;

export function useRewardedAd() {
    const [isAdReady, setIsAdReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [admob, setAdmob] = useState(null);

    // Initialize AdMob on mount (native only)
    useEffect(() => {
        if (!isNative) {
            // Mock mode - always ready
            setIsAdReady(true);
            return;
        }

        const initAdMob = async () => {
            try {
                // Dynamic import for AdMob
                const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

                await AdMob.initialize({
                    testingDevices: ['DEVICE_ID'], // Replace with actual test device IDs
                    initializeForTesting: true,
                });

                setAdmob(AdMob);

                // Prepare rewarded ad
                await AdMob.prepareRewardVideoAd({
                    adId: 'ca-app-pub-3940256099942544/5224354917', // Test ad unit
                    isTesting: true,
                });

                setIsAdReady(true);
                console.log('[RewardedAd] Initialized and ready');
            } catch (e) {
                console.error('[RewardedAd] Init error:', e);
                setIsAdReady(true); // Fallback to mock
            }
        };

        initAdMob();
    }, []);

    // Show rewarded ad
    const showRewardedAd = useCallback(async (onRewarded) => {
        setIsLoading(true);

        try {
            if (isNative && admob) {
                // Real AdMob
                const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

                // Listen for reward
                const rewardListener = AdMob.addListener(
                    RewardAdPluginEvents.Rewarded,
                    () => {
                        console.log('[RewardedAd] User earned reward');
                        onRewarded?.();
                        rewardListener.remove();
                    }
                );

                await AdMob.showRewardVideoAd();

                // Prepare next ad
                await AdMob.prepareRewardVideoAd({
                    adId: 'ca-app-pub-3940256099942544/5224354917',
                    isTesting: true,
                });
            } else {
                // Mock ad for development
                console.log('[RewardedAd] Mock: Simulating ad view...');
                await new Promise(resolve => setTimeout(resolve, MOCK_AD_DELAY));
                console.log('[RewardedAd] Mock: Ad completed');
                onRewarded?.();
            }
        } catch (e) {
            console.error('[RewardedAd] Show error:', e);
            // Grant reward anyway on error for better UX
            onRewarded?.();
        } finally {
            setIsLoading(false);
        }
    }, [admob]);

    return {
        isAdReady,
        isLoading,
        showRewardedAd,
    };
}

/**
 * useBannerAd Hook - Banner Ad Management
 * Shows banner ad at bottom of screen (above navigation)
 * Hidden during gameplay for better UX
 */
import { useState, useCallback, useEffect, useRef } from 'react';

// Check if we're in a Capacitor native environment
const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();

export function useBannerAd() {
    const [isBannerVisible, setIsBannerVisible] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const admobRef = useRef(null);

    // Initialize AdMob on mount (native only)
    useEffect(() => {
        if (!isNative) {
            setIsInitialized(true);
            return;
        }

        const initAdMob = async () => {
            try {
                const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
                admobRef.current = { AdMob, BannerAdPosition, BannerAdSize };
                setIsInitialized(true);
                console.log('[BannerAd] Initialized');
            } catch (e) {
                console.error('[BannerAd] Init error:', e);
                setIsInitialized(true);
            }
        };

        initAdMob();
    }, []);

    // Show banner ad
    const showBanner = useCallback(async () => {
        if (isBannerVisible) return;

        if (isNative && admobRef.current) {
            try {
                const { AdMob, BannerAdPosition, BannerAdSize } = admobRef.current;

                await AdMob.showBanner({
                    adId: 'ca-app-pub-3940256099942544/6300978111', // Test ad unit
                    adSize: BannerAdSize.ADAPTIVE_BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER,
                    margin: 60, // Space for bottom navigation
                    isTesting: true,
                });

                console.log('[BannerAd] Shown');
            } catch (e) {
                console.error('[BannerAd] Show error:', e);
            }
        }

        setIsBannerVisible(true);
    }, [isBannerVisible]);

    // Hide banner ad
    const hideBanner = useCallback(async () => {
        if (!isBannerVisible) return;

        if (isNative && admobRef.current) {
            try {
                const { AdMob } = admobRef.current;
                await AdMob.hideBanner();
                console.log('[BannerAd] Hidden');
            } catch (e) {
                console.error('[BannerAd] Hide error:', e);
            }
        }

        setIsBannerVisible(false);
    }, [isBannerVisible]);

    return {
        showBanner,
        hideBanner,
        isBannerVisible,
        isInitialized,
    };
}

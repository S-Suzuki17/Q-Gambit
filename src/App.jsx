/**
 * Q-Gambit: Quantum Chess
 * Main Application Component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useMatchmaking } from './hooks/useMatchmaking';
import { useUserProfile } from './hooks/useUserProfile';
import { useDailyPlayLimit } from './hooks/useDailyPlayLimit';
import { useRewardedAd } from './hooks/useRewardedAd';
import { useBannerAd } from './hooks/useBannerAd';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useMatchHistory } from './hooks/useMatchHistory';
import { useAchievements } from './hooks/useAchievements';
import { useDetailedStats } from './hooks/useDetailedStats';
import { useGameRecord } from './hooks/useGameRecord';

// Components
import { Header, Navigation, MatchmakingOverlay } from './components/ui';
import { HomeTab, ProfileTab } from './components/tabs';
import { AdGateModal } from './components/modals';
import GameScreen from './screens/GameScreen';

import './index.css';

// ===== Main App Component =====
export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { profile, rating, tier, loading: profileLoading } = useUserProfile(user);
  const {
    isSearching,
    matchedRoom,
    waitTime,
    currentRange,
    startMatchmaking,
    cancelMatchmaking,
    resetMatch
  } = useMatchmaking(user, rating);

  // Daily play limit
  const {
    canPlayFree,
    remainingFreeGames,
    freeGamesPerDay,
    incrementPlayCount,
    grantBonusGame,
  } = useDailyPlayLimit();

  // Ads
  const { showRewardedAd, isLoading: isAdLoading } = useRewardedAd();
  const { showBanner, hideBanner } = useBannerAd();

  const [activeTab, setActiveTab] = useState('home');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showAdGate, setShowAdGate] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  // Leaderboard
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard();

  // Online status
  const { onlineCount } = useOnlineStatus(user);

  // Match history
  const { history: matchHistory } = useMatchHistory(user);

  // Achievements
  const { getUnlockedAchievements } = useAchievements(user, profile);

  // Detailed stats
  const { stats: detailedStats, getWhiteWinRate, getBlackWinRate } = useDetailedStats(user);

  // Game record (replay)
  const { records: gameRecords, retentionDays } = useGameRecord(user);

  // Handle match found
  useEffect(() => {
    if (matchedRoom) {
      setCurrentRoom(matchedRoom);
      incrementPlayCount();
    }
  }, [matchedRoom, incrementPlayCount]);

  // Banner ad visibility based on screen
  useEffect(() => {
    if (currentRoom || isSearching) {
      hideBanner();
    } else {
      showBanner();
    }
  }, [currentRoom, isSearching, showBanner, hideBanner]);

  // Handle play request with ad gate
  const handlePlayRequest = useCallback((mode = 'rapid') => {
    if (canPlayFree) {
      const modeRating = profile?.ratings?.[mode] || rating || 1500;
      startMatchmaking(mode, modeRating);
    } else {
      setPendingMode(mode);
      setShowAdGate(true);
    }
  }, [canPlayFree, startMatchmaking, profile, rating]);

  // Handle watch ad
  const handleWatchAd = useCallback(() => {
    showRewardedAd(() => {
      grantBonusGame();
      setShowAdGate(false);
      const mode = pendingMode || 'rapid';
      const modeRating = profile?.ratings?.[mode] || rating || 1500;
      startMatchmaking(mode, modeRating);
      setPendingMode(null);
    });
  }, [showRewardedAd, grantBonusGame, startMatchmaking, pendingMode, profile, rating]);

  // Handle tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    if (tabId === 'play') {
      handlePlayRequest();
    }
  }, [handlePlayRequest]);

  // Handle exit game
  const handleExitGame = useCallback(() => {
    setCurrentRoom(null);
    resetMatch();
    cancelMatchmaking();
    setActiveTab('home');
  }, [cancelMatchmaking, resetMatch]);

  // Auth/Profile loading
  if (authLoading || profileLoading) {
    return (
      <div className="loading-overlay">
        <Loader2 size={32} className="animate-spin loading-icon" />
        <p className="loading-text">量子状態を初期化中...</p>
      </div>
    );
  }

  // Game screen
  if (currentRoom) {
    return <GameScreen roomInfo={currentRoom} user={user} onExit={handleExitGame} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        user={user}
        rating={rating}
        tier={tier}
        gamesPlayed={profile?.gamesPlayed}
      />

      {/* Main Content */}
      <main className="custom-scrollbar main-content">
        {activeTab === 'home' && (
          <HomeTab
            onQuickMatch={handlePlayRequest}
            remainingFreeGames={remainingFreeGames}
            freeGamesPerDay={freeGamesPerDay}
            onlineCount={onlineCount}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            leaderboard={leaderboard}
            leaderboardLoading={leaderboardLoading}
            matchHistory={matchHistory}
            achievements={getUnlockedAchievements()}
            detailedStats={detailedStats}
            whiteWinRate={getWhiteWinRate()}
            blackWinRate={getBlackWinRate()}
            gameRecords={gameRecords}
            retentionDays={retentionDays}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Matchmaking Overlay */}
      {isSearching && (
        <MatchmakingOverlay
          onCancel={cancelMatchmaking}
          waitTime={waitTime}
          currentRange={currentRange}
          rating={rating}
        />
      )}

      {/* Ad Gate Modal */}
      {showAdGate && (
        <AdGateModal
          onWatchAd={handleWatchAd}
          onClose={() => setShowAdGate(false)}
          isLoading={isAdLoading}
        />
      )}
    </div>
  );
}

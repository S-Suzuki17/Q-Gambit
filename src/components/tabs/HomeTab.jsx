/**
 * HomeTab Component
 * Main lobby screen with game mode selection
 */
import React from 'react';
import { Play, Clock, Zap, Flame, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function HomeTab({ onQuickMatch, remainingFreeGames, freeGamesPerDay, onlineCount }) {
    const { t } = useTranslation();

    return (
        <div className="animate-slide-up home-tab">
            {/* Daily Limit Banner */}
            <div className={`daily-limit-banner ${remainingFreeGames > 0 ? 'has-games' : 'no-games'}`}>
                <div className="daily-limit-left">
                    <Play size={16} color={remainingFreeGames > 0 ? 'var(--cyan-glow)' : 'var(--rose-glow)'} />
                    <span className="daily-limit-label">{t('lobby.daily_matches')}</span>
                </div>
                <div className={`daily-limit-count ${remainingFreeGames > 0 ? 'has-games' : 'no-games'}`}>
                    <span>{remainingFreeGames}</span>
                    <span className="daily-limit-total">/ {freeGamesPerDay}</span>
                </div>
            </div>

            {/* Game Modes */}
            <h3 className="section-header">{t('lobby.start_match')}</h3>
            <div className="game-modes-grid">
                <button
                    onClick={() => onQuickMatch('rapid')}
                    className="card card-glow game-mode-btn"
                >
                    <Clock size={24} color="var(--indigo-glow)" />
                    <div className="game-mode-info">
                        <span className="game-mode-name">{t('lobby.rapid')}</span>
                        <span className="game-mode-time">10 min</span>
                    </div>
                </button>

                <button
                    onClick={() => onQuickMatch('blitz')}
                    className="card card-glow game-mode-btn"
                >
                    <Zap size={24} color="var(--cyan-glow)" />
                    <div className="game-mode-info">
                        <span className="game-mode-name">{t('lobby.blitz')}</span>
                        <span className="game-mode-time">3 min</span>
                    </div>
                </button>

                <button
                    onClick={() => onQuickMatch('speed')}
                    className="card card-glow game-mode-btn"
                >
                    <Flame size={24} color="var(--rose-glow)" />
                    <div className="game-mode-info">
                        <span className="game-mode-name">{t('lobby.speed')}</span>
                        <span className="game-mode-time">10s/mv</span>
                    </div>
                </button>
            </div>

            {/* Online Count */}
            <div className="online-count-container">
                <button className="card card-glow online-count-card">
                    <div className="online-count-icon">
                        <User size={24} />
                    </div>
                    <span className="online-count-text">
                        {t('lobby.online_count', { count: onlineCount || 1 })}
                    </span>
                </button>
            </div>

            {/* Note: Friends list removed - feature not implemented */}
        </div>
    );
}

export default HomeTab;

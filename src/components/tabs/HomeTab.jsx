/**
 * HomeTab Component
 * Main lobby screen with game mode selection
 */
import React, { useState } from 'react';
import { Play, Clock, Zap, Flame, User, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RulesModal from '../modals/RulesModal';

function HomeTab({ onQuickMatch, remainingFreeGames, freeGamesPerDay, onlineCount, bonusTickets, onOpenInventory }) {
    const { t } = useTranslation();
    const [showRules, setShowRules] = useState(false);

    return (
        <div className="animate-slide-up home-tab">
            {/* Daily Limit Banner */}
            <div className={`daily-limit-banner ${remainingFreeGames > 0 || bonusTickets > 0 ? 'has-games' : 'no-games'}`}>
                <div className="daily-limit-left">
                    <Play size={16} color={remainingFreeGames > 0 ? 'var(--cyan-glow)' : 'var(--rose-glow)'} />
                    <span className="daily-limit-label">{t('lobby.daily_matches')}</span>
                </div>
                <div className="daily-limit-count-group">
                    <div className={`daily-limit-count ${remainingFreeGames > 0 ? 'has-games' : 'no-games'}`}>
                        <span>{remainingFreeGames}</span>
                        <span className="daily-limit-total">/ {freeGamesPerDay}</span>
                    </div>
                </div>
                {/* Tickets Display */}
                {bonusTickets > 0 && (
                    <div className="ticket-badge" title="Free Game Tickets">
                        <span className="ticket-icon">🎫</span>
                        <span className="ticket-count">+{bonusTickets}</span>
                    </div>
                )}
            </div>

            <div className="home-action-buttons">
                {/* How to Play Button */}
                <button
                    className="btn btn-secondary home-action-btn"
                    onClick={() => setShowRules(true)}
                >
                    <BookOpen size={18} color="var(--cyan-glow)" />
                    <span>{t('lobby.how_to_play')}</span>
                </button>

                {/* Inventory Button */}
                <button
                    className="btn btn-secondary home-action-btn"
                    onClick={onOpenInventory}
                >
                    <span style={{ fontSize: '18px' }}>🎒</span>
                    <span>{t('lobby.inventory')}</span>
                </button>
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

            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
        </div>
    );
}

export default HomeTab;

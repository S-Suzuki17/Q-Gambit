/**
 * MatchmakingOverlay Component
 * Shown while searching for opponents
 */
import React from 'react';
import { Zap, Trophy, Clock, Target } from 'lucide-react';
import { formatTimeMs } from '../../utils/formatters';

function MatchmakingOverlay({ onCancel, waitTime, currentRange, rating }) {
    return (
        <div className="loading-overlay animate-fade-in">
            <div className="loading-pulse"></div>
            <Zap
                size={28}
                className="matchmaking-icon"
            />
            <h2 className="matchmaking-title">
                対戦相手を検索中
            </h2>

            {/* Rating Display */}
            <div className="matchmaking-rating">
                <Trophy size={14} color="var(--amber-glow)" />
                <span className="matchmaking-rating-text">
                    Rating: {rating}
                </span>
            </div>

            {/* Search Info */}
            <div className="matchmaking-info">
                <div className="matchmaking-info-item">
                    <Clock size={12} />
                    <span>{formatTimeMs(waitTime)}</span>
                </div>
                <div className="matchmaking-info-item">
                    <Target size={12} />
                    <span>±{currentRange === Infinity ? '∞' : currentRange}</span>
                </div>
            </div>

            <button
                className="btn btn-secondary matchmaking-cancel"
                onClick={onCancel}
            >
                検索をキャンセル
            </button>
        </div>
    );
}

export default MatchmakingOverlay;

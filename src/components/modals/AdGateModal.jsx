/**
 * AdGateModal Component
 * Shown when user has no free games and needs to watch an ad
 */
import React from 'react';
import { Play, Loader2 } from 'lucide-react';

function AdGateModal({ onWatchAd, onClose, isLoading }) {
    return (
        <div className="game-over-modal">
            <div className="card animate-zoom-in ad-gate-content">
                <div className="ad-gate-icon">
                    <Play size={28} color="var(--amber-glow)" />
                </div>

                <h3 className="ad-gate-title">本日の無料対局終了</h3>

                <p className="ad-gate-message">
                    広告を見ると、
                    <br />
                    <span className="ad-gate-highlight">もう1局</span>
                    プレイできます
                </p>

                <div className="ad-gate-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        あとで
                    </button>
                    <button
                        className="btn btn-primary ad-gate-watch-btn"
                        onClick={onWatchAd}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>読込中...</span>
                            </>
                        ) : (
                            <>
                                <Play size={16} fill="currentColor" />
                                <span>広告を見る</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdGateModal;

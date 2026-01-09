/**
 * GameOverModal Component
 * Displays game result and options after game ends
 */
import React from 'react';
import { RotateCcw, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function GameOverModal({ winner, myColor, onPlayAgain, onExit }) {
    const { t } = useTranslation();
    const isVictory = (winner === 'WHITE' && myColor === 'white') ||
        (winner === 'BLACK' && myColor === 'black');

    // Convert internal winner value to display color
    const winnerDisplay = winner === 'WHITE' ? 'CYAN' : 'ROSE';

    const handleShare = () => {
        const text = isVictory
            ? t('game.share_message_win')
            : t('game.share_message_loss');
        const url = "https://q-gambit.vercel.app";
        const hashtags = "QuantumChess,QGambit"; // No specific hashtags in prompt but good to have
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
        window.open(twitterUrl, '_blank');
    };

    return (
        <div className="game-over-modal">
            <div className="game-over-content">
                <div className={`game-over-title ${isVictory ? 'victory' : 'defeat'}`}>
                    {isVictory ? `🏆 ${t('game.victory')}` : `💀 ${t('game.defeat')}`}
                </div>
                <p className="game-over-message">
                    {t('game.wins_by_capture', { winner: winnerDisplay })}
                </p>
                <div className="game-over-actions">
                    <button className="btn btn-primary" onClick={onPlayAgain}>
                        <RotateCcw size={16} className="btn-icon" />
                        {t('game.play_again')}
                    </button>
                    <button className="btn btn-primary" style={{ background: '#1DA1F2' }} onClick={handleShare}>
                        <Share2 size={16} className="btn-icon" />
                        {t('game.share')}
                    </button>
                    <button className="btn btn-secondary" onClick={onExit}>
                        {t('game.exit')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverModal;

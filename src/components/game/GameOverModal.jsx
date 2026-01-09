/**
 * GameOverModal Component
 * Displays game result and options after game ends
 */
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function GameOverModal({ winner, myColor, onPlayAgain, onExit }) {
    const { t } = useTranslation();
    const isVictory = (winner === 'WHITE' && myColor === 'white') ||
        (winner === 'BLACK' && myColor === 'black');

    // Convert internal winner value to display color
    const winnerDisplay = winner === 'WHITE' ? 'CYAN' : 'ROSE';

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
                    <button className="btn btn-secondary" onClick={onExit}>
                        {t('game.exit')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverModal;

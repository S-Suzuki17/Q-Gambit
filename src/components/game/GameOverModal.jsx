/**
 * GameOverModal Component
 * Displays game result and options after game ends
 */
import React from 'react';
import { RotateCcw } from 'lucide-react';

function GameOverModal({ winner, myColor, onPlayAgain, onExit }) {
    const isVictory = (winner === 'WHITE' && myColor === 'white') ||
        (winner === 'BLACK' && myColor === 'black');

    // Convert internal winner value to display color
    const winnerDisplay = winner === 'WHITE' ? 'CYAN' : 'ROSE';

    return (
        <div className="game-over-modal">
            <div className="game-over-content">
                <div className={`game-over-title ${isVictory ? 'victory' : 'defeat'}`}>
                    {isVictory ? '🏆 VICTORY' : '💀 DEFEAT'}
                </div>
                <p className="game-over-message">
                    {winnerDisplay} wins by King capture
                </p>
                <div className="game-over-actions">
                    <button className="btn btn-primary" onClick={onPlayAgain}>
                        <RotateCcw size={16} className="btn-icon" />
                        Play Again
                    </button>
                    <button className="btn btn-secondary" onClick={onExit}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverModal;

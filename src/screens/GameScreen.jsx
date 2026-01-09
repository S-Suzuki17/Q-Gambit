/**
 * GameScreen Component
 * Main game play screen with board and controls
 */
import React, { useState } from 'react';
import { Loader2, Flag, Info } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { ChessBoard, TurnIndicator, GameOverModal } from '../components/game';
import { SYMBOLS } from '../utils/quantumChess';
import { formatTimeSeconds } from '../utils/formatters';

function GameScreen({ roomInfo, user, onExit }) {
    const {
        gameState,
        selectedPiece,
        validMoves,
        myColor,
        isMyTurn,
        lastMove,
        selectPiece,
        clickSquare,
        resign,
        whiteTime,
        blackTime
    } = useGame(roomInfo, user);

    const [showResignConfirm, setShowResignConfirm] = useState(false);

    if (!gameState) {
        return (
            <div className="loading-overlay">
                <Loader2 size={32} className="animate-spin loading-icon" />
                <p className="loading-text">Loading game...</p>
            </div>
        );
    }

    const handlePlayAgain = () => {
        onExit();
    };

    return (
        <div className="game-container">
            {/* Game Header */}
            <div className="game-header">
                <button onClick={() => setShowResignConfirm(true)} className="resign-btn">
                    <Flag size={18} />
                    <span className="resign-label">Resign</span>
                </button>

                {/* Timers */}
                <div className="game-timers">
                    <div className={`timer ${myColor !== 'white' && isMyTurn ? 'active' : ''} ${myColor !== 'white' ? 'opponent' : ''}`}>
                        <span className="timer-label">OPP</span>
                        {formatTimeSeconds(myColor === 'white' ? blackTime : whiteTime)}
                    </div>
                    <div className={`timer ${myColor === 'white' && isMyTurn ? 'active' : ''} ${myColor === 'white' ? '' : 'opponent'}`}>
                        <span className="timer-label">YOU</span>
                        {formatTimeSeconds(myColor === 'white' ? whiteTime : blackTime)}
                    </div>
                </div>

                <div className="move-counter">
                    <Info size={14} />
                    <span>Moves: {gameState.history.length}</span>
                </div>
            </div>

            {/* Turn Indicator */}
            <TurnIndicator isMyTurn={isMyTurn} myColor={myColor} gameState={gameState} />

            {/* Chess Board */}
            <ChessBoard
                gameState={gameState}
                selectedPiece={selectedPiece}
                validMoves={validMoves}
                lastMove={lastMove}
                onSelectPiece={selectPiece}
                onClickSquare={clickSquare}
                myColor={myColor}
            />

            {/* Piece Info */}
            {selectedPiece && (
                <div className="card animate-slide-up piece-info-card">
                    <div className="piece-info-content">
                        <div className={`piece-info-icon ${selectedPiece.team === 0 ? 'white' : 'black'}`}>
                            {selectedPiece.possibilities.length === 1 ? (
                                <span className="piece-symbol-lg">{SYMBOLS[selectedPiece.possibilities[0]]}</span>
                            ) : (
                                <div className={`quantum-orb ${selectedPiece.team === 0 ? 'white' : 'black'}`}></div>
                            )}
                        </div>
                        <div className="piece-info-text">
                            <p className="piece-info-title">
                                {selectedPiece.possibilities.length === 1
                                    ? `Confirmed: ${selectedPiece.possibilities[0]}`
                                    : `Superposition (${selectedPiece.possibilities.length} states)`
                                }
                            </p>
                            <p className="piece-info-possibilities">
                                Possibilities: {selectedPiece.possibilities.map(t => SYMBOLS[t]).join(' ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over */}
            {gameState.gameOver && (
                <GameOverModal
                    winner={gameState.gameOver}
                    myColor={myColor}
                    onPlayAgain={handlePlayAgain}
                    onExit={onExit}
                />
            )}

            {/* Resign Confirmation */}
            {showResignConfirm && (
                <div className="game-over-modal">
                    <div className="card animate-zoom-in resign-confirm-content">
                        <h3 className="resign-confirm-title">Resign Game?</h3>
                        <p className="resign-confirm-message">You will lose this match.</p>
                        <div className="resign-confirm-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowResignConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => { resign(); setShowResignConfirm(false); }}
                            >
                                Resign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameScreen;

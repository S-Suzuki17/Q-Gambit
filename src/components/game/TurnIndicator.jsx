/**
 * TurnIndicator Component
 * Shows whose turn it is in the game
 */
import React from 'react';

function TurnIndicator({ isMyTurn, myColor, gameState }) {
    if (!gameState) return null;

    // Use visual color names instead of chess terms
    const myDisplayColor = myColor === 'white' ? 'CYAN' : 'ROSE';
    const currentTurnDisplay = gameState.turn === 0 ? 'CYAN' : 'ROSE';

    return (
        <div className={`turn-indicator ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
            {isMyTurn ? (
                <>🎯 YOUR TURN ({myDisplayColor})</>
            ) : (
                <>⏳ OPPONENT'S TURN ({currentTurnDisplay})</>
            )}
        </div>
    );
}

export default TurnIndicator;

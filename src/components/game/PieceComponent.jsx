/**
 * PieceComponent
 * Renders a chess piece with quantum superposition visualization
 */
import React from 'react';
import { SYMBOLS } from '../../utils/quantumChess';

function PieceComponent({ piece }) {
    const teamClass = piece.team === 0 ? 'white' : 'black';
    const isConfirmed = piece.possibilities.length === 1;

    if (isConfirmed) {
        // Confirmed piece - show icon
        return (
            <span className={`chess-piece ${teamClass}`}>
                {SYMBOLS[piece.possibilities[0]]}
            </span>
        );
    }

    // Superposition - show all possibilities orbiting around center
    const count = piece.possibilities.length;
    const radius = count <= 3 ? 10 : count <= 5 ? 12 : 14;

    return (
        <div className={`quantum-orb-container ${teamClass}`}>
            {/* Orbiting possibilities */}
            <div className="possibilities-orbit">
                {piece.possibilities.map((type, idx) => {
                    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return (
                        <span
                            key={type}
                            className={`possibility-symbol ${teamClass}`}
                            style={{
                                transform: `translate(${x}px, ${y}px)`,
                            }}
                        >
                            {SYMBOLS[type]}
                        </span>
                    );
                })}
            </div>
            {/* Center energy core */}
            <div className={`quantum-core ${teamClass}`} />
            <span className="possibility-count">{count}</span>
        </div>
    );
}

// Custom comparison function for React.memo
// Only re-render if visual properties change
function arePropsEqual(prevProps, nextProps) {
    const p1 = prevProps.piece;
    const p2 = nextProps.piece;

    return (
        p1.id === p2.id &&
        p1.team === p2.team &&
        p1.x === p2.x &&
        p1.y === p2.y &&
        p1.captured === p2.captured &&
        p1.possibilities.length === p2.possibilities.length &&
        // Start superposition possibilities check only if length is same
        p1.possibilities.every((val, index) => val === p2.possibilities[index])
    );
}

export default React.memo(PieceComponent, arePropsEqual);

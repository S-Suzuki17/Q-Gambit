/**
 * PieceComponent
 * Renders a chess piece with quantum superposition visualization
 */
import React from 'react';
import { motion } from 'framer-motion';
import { SYMBOLS } from '../../utils/quantumChess';

function PieceComponent({ piece }) {
    const teamClass = piece.team === 0 ? 'white' : 'black';
    const isConfirmed = piece.possibilities.length === 1;

    if (isConfirmed) {
        // Confirmed piece - show icon
        return (
            <motion.span
                className={`chess-piece ${teamClass}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {SYMBOLS[piece.possibilities[0]]}
            </motion.span>
        );
    }

    // Superposition - show all possibilities orbiting around center
    const count = piece.possibilities.length;
    const radius = count <= 3 ? 10 : count <= 5 ? 12 : 14;

    return (
        <motion.div
            className={`quantum-orb-container ${teamClass}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
        >
            {/* Orbiting possibilities */}
            <motion.div
                className="possibilities-orbit"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
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
            </motion.div>
            {/* Center energy core */}
            <div className={`quantum-core ${teamClass}`} />
            <span className="possibility-count">{count}</span>
        </motion.div>
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

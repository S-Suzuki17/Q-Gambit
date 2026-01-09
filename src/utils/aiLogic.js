/**
 * Advanced AI Logic for Q-Gambit
 * Uses Minimax with Alpha-Beta pruning and probabilistic evaluation
 */
import { getValidMoves, attemptMove, checkGameOver, PIECE_TYPES } from './quantumChess';

// Piece values for evaluation
const PIECE_VALUES = {
    'K': 20000,
    'Q': 900,
    'R': 500,
    'B': 330,
    'N': 320,
    'P': 100,
};

// Position bonuses (simplified)
const POSITION_BONUS = {
    center: 10,
    advance: 5,
};

/**
 * Calculate the expected value of a piece based on its quantum state
 * @param {Object} piece - The piece to evaluate
 * @returns {number} Expected value score
 */
function getPieceValue(piece) {
    if (!piece.possibilities || piece.possibilities.length === 0) return 0;

    // Calculate average value of all possibilities
    let totalValue = 0;
    for (const type of piece.possibilities) {
        totalValue += (PIECE_VALUES[type] || 0);
    }

    return totalValue / piece.possibilities.length;
}

/**
 * Evaluate the board state
 * @returns {number} Positive for white advantage, negative for black
 */
export function evaluateBoard(board, pieces) {
    // Check for immediate game over
    const winner = checkGameOver(pieces);
    if (winner === 'WHITE') return Infinity;
    if (winner === 'BLACK') return -Infinity;

    let score = 0;

    for (const piece of pieces) {
        if (!piece.alive && !piece.captured) continue; // Skip dead pieces
        if (piece.captured) continue; // Skip captured pieces (already accounted for by lack of presence)

        const value = getPieceValue(piece);
        const teamMultiplier = piece.team === 0 ? 1 : -1;

        // Material score
        score += value * teamMultiplier;

        // Positional score
        // Center control (d4, d5, e4, e5)
        if (piece.x >= 3 && piece.x <= 4 && piece.y >= 3 && piece.y <= 4) {
            score += POSITION_BONUS.center * 2 * teamMultiplier;
        } else if (piece.x >= 2 && piece.x <= 5 && piece.y >= 2 && piece.y <= 5) {
            score += POSITION_BONUS.center * teamMultiplier;
        }

        // Pawn advancement
        if (piece.possibilities.includes('P')) {
            const advancement = piece.team === 0 ? piece.y : (7 - piece.y);
            // More bonus for advancing further
            score += advancement * POSITION_BONUS.advance * teamMultiplier;
        }
    }

    return score;
}

/**
 * Get all possible moves for a team
 * Optimized to order moves for better alpha-beta pruning (captures first)
 */
export function getAllMoves(board, pieces, team) {
    const moves = [];

    for (const piece of pieces) {
        if (piece.captured || piece.team !== team) continue;

        const validMoves = getValidMoves(piece, board, pieces);
        for (const move of validMoves) {
            moves.push({
                piece,
                from: { x: piece.x, y: piece.y },
                to: move, // {x, y, isCapture}
                score: move.isCapture ? 10 : 0, // Simple heuristic for move ordering
            });
        }
    }

    // Sort moves: Captures first to maximize pruning
    return moves.sort((a, b) => b.score - a.score);
}

/**
 * Minimax with Alpha-Beta Pruning
 * @param {number} depth - Remaining depth
 * @param {boolean} isMaximizing - True if AI is white (maximizing)
 * @param {number} alpha - Best value for maximizer
 * @param {number} beta - Best value for minimizer
 */
function minimax(board, pieces, depth, isMaximizing, alpha, beta) {
    if (depth === 0) {
        return evaluateBoard(board, pieces);
    }

    const team = isMaximizing ? 0 : 1;
    const moves = getAllMoves(board, pieces, team);

    if (moves.length === 0) {
        // No moves available (Stalemate or Checkmate logic could go here)
        return evaluateBoard(board, pieces);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            // Simulate move
            // Note: attemptMove resolves entanglement, which is computationally expensive
            // For deeper searches, we might need a lighter simulation
            const result = attemptMove(pieces, board, move.piece.id, move.to.x, move.to.y);

            if (result.success) {
                const evalScore = minimax(result.board, result.pieces, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break; // Pruning
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const result = attemptMove(pieces, board, move.piece.id, move.to.x, move.to.y);

            if (result.success) {
                const evalScore = minimax(result.board, result.pieces, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break; // Pruning
            }
        }
        return minEval;
    }
}

/**
 * Find the best move using Minimax
 */
export function findBestMove(board, pieces, aiTeam, depth = 3) {
    const isMaximizing = aiTeam === 0;
    const moves = getAllMoves(board, pieces, aiTeam);

    if (moves.length === 0) return null;

    let bestMove = null;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    // Iterate through root moves
    for (const move of moves) {
        const result = attemptMove(pieces, board, move.piece.id, move.to.x, move.to.y);

        if (result.success) {
            // If we found a mate in 1, take it immediately
            const winner = checkGameOver(result.pieces);
            if ((isMaximizing && winner === 'WHITE') || (!isMaximizing && winner === 'BLACK')) {
                return move;
            }

            const moveValue = minimax(result.board, result.pieces, depth - 1, !isMaximizing, alpha, beta);

            if (isMaximizing) {
                if (moveValue > bestValue) {
                    bestValue = moveValue;
                    bestMove = move;
                }
                alpha = Math.max(alpha, bestValue);
            } else {
                if (moveValue < bestValue) {
                    bestValue = moveValue;
                    bestMove = move;
                }
                beta = Math.min(beta, bestValue);
            }
        }
    }

    // Fallback if search failed to find a 'best' (shouldn't happen unless all moves fail)
    return bestMove || moves[0];
}

/**
 * Async wrapper for AI move to prevent blocking UI
 */
export async function makeAIMove(board, pieces, aiTeam, delayMs = 500) {
    return new Promise((resolve) => {
        // Use setTimeout to allow UI to render before calculation spikes CPU
        setTimeout(() => {
            const t0 = performance.now();
            const move = findBestMove(board, pieces, aiTeam, 2); // Depth 2 is safer for performance
            const t1 = performance.now();
            console.log(`AI Thought Time: ${(t1 - t0).toFixed(2)}ms`);
            resolve(move);
        }, delayMs);
    });
}

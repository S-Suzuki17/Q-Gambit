import { describe, it, expect } from 'vitest';
import { evaluateBoard, findBestMove, getAllMoves } from '../utils/aiLogic';
import { createInitialBoard, getValidMoves } from '../utils/quantumChess';

// Helper to manually set up board correctly
function coordToIndex(x, y) {
    return y * 8 + x;
}

describe('AI Logic', () => {
    it('should evaluate initial board as equal', () => {
        const { board, pieces } = createInitialBoard();
        const score = evaluateBoard(board, pieces);
        expect(Math.abs(score)).toBeLessThan(1);
    });

    it('should find moves for AI', () => {
        const { board, pieces } = createInitialBoard();
        const moves = getAllMoves(board, pieces, 0);
        expect(moves.length).toBeGreaterThan(0);
    });

    it('should generate capture move properly', () => {
        let { board, pieces } = createInitialBoard();
        pieces = [];
        board = new Array(64).fill(null);
        
        // White Rook at 0,0
        const rook = { id: 0, team: 0, possibilities: ['R'], x: 0, y: 0, alive: true, captured: false };
        pieces.push(rook);
        board[coordToIndex(0, 0)] = 0;
        
        // Black Queen at 0,1 (index 8)
        const queen = { id: 1, team: 1, possibilities: ['Q'], x: 0, y: 1, alive: true, captured: false };
        pieces.push(queen);
        board[coordToIndex(0, 1)] = 1;
        
        const moves = getValidMoves(rook, board, pieces);
        const captureMove = moves.find(m => m.x === 0 && m.y === 1 && m.isCapture);
        
        expect(captureMove).toBeDefined();
    });

    it('should prefer capturing a high value piece', () => {
        let { board, pieces } = createInitialBoard();
        pieces = [];
        board = new Array(64).fill(null);

        // White Rook at 0,0
        pieces.push({ id: 0, team: 0, possibilities: ['R'], x: 0, y: 0, alive: true, captured: false });
        board[coordToIndex(0, 0)] = 0;
        
        // White King at 7,7
        pieces.push({ id: 2, team: 0, possibilities: ['K'], x: 7, y: 7, alive: true, captured: false });
        board[coordToIndex(7, 7)] = 2;
        
        // Black Queen at 0,1
        pieces.push({ id: 1, team: 1, possibilities: ['Q'], x: 0, y: 1, alive: true, captured: false });
        board[coordToIndex(0, 1)] = 1;

        // Black King at 2,2 (safe from Rook's direct line)
        pieces.push({ id: 3, team: 1, possibilities: ['K'], x: 2, y: 2, alive: true, captured: false });
        board[coordToIndex(2, 2)] = 3;

        const bestMove = findBestMove(board, pieces, 0, 1);

        expect(bestMove).toBeDefined();
        expect(bestMove.to.isCapture).toBe(true);
        expect(bestMove.to.x).toBe(0);
        expect(bestMove.to.y).toBe(1);
    });
});

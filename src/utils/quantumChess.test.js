import { describe, it, expect } from 'vitest';
import { createInitialBoard, getValidMoves, attemptMove, filterPossibilities } from '../utils/quantumChess';

describe('Quantum Chess Logic', () => {
    it('should create initial board correctly', () => {
        const { board, pieces } = createInitialBoard();
        expect(board.length).toBe(64);
        expect(pieces.length).toBe(32); // 16 white + 16 black
        
        // Check filtering works (e.g. piece 0 is at 0,0)
        const p0 = pieces.find(p => p.id === board[0]);
        expect(p0).toBeDefined();
        expect(p0.possibilities.length).toBe(6); // P, N, B, R, Q, K
    });

    it('should generate valid moves for a pawn-like quantum piece', () => {
        const { board, pieces } = createInitialBoard();
        // Pick a front-row white pawn (y=1)
        // It's in superposition, so it could be anything.
        // But let's test if it can move forward as a pawn
        const pawnIndex = 8; // a2
        const pieceId = board[pawnIndex];
        const piece = pieces.find(p => p.id === pieceId);
        
        const moves = getValidMoves(piece, board, pieces);
        
        // Should be able to move forward (Pawn move)
        const forwardMove = moves.find(m => m.x === piece.x && m.y === piece.y + 1);
        expect(forwardMove).toBeDefined();
        
        // Should NOT be able to move backwards
        const backwardMove = moves.find(m => m.x === piece.x && m.y === piece.y - 1);
        expect(backwardMove).toBeUndefined();
    });

    it('should filter possibilities upon observation', () => {
        const { board, pieces } = createInitialBoard();
        const pawnIndex = 8; // a2
        const pieceId = board[pawnIndex];
        const piece = pieces.find(p => p.id === pieceId);
        
        // Valid pawn move: forward 1 square (from 0,1 to 0,2)
        // This is valid for Pawn, King, Rook, Queen.
        // It is NOT valid for Bishop (diagonal) or Knight (L-shape).
        
        const validTypes = filterPossibilities(piece, 0, 2, board, false);
        
        expect(validTypes).toContain('P');
        expect(validTypes).toContain('K');
        expect(validTypes).toContain('R');
        expect(validTypes).toContain('Q');
        
        expect(validTypes).not.toContain('B'); // Bishop can't move straight
        expect(validTypes).not.toContain('N'); // Knight can't move straight 1
    });

    it('should collapse wave function when only one possibility remains', () => {
        let { board, pieces } = createInitialBoard();
        const pieceId = board[9]; // b2
        
        // Knight move: b2 (1,1) -> c4 (2,3)
        // Valid for: Knight only (from initial position, P can't, B can't, R can't, Q can't, K can't)
        // Wait, Queen can't jump? Queen is sliding. Path must be clear.
        // b3 is empty? Yes. So Queen could move there if diagonal? No (1,1)->(2,3) is not diagonal.
        // So ONLY Knight can allow (1,1) -> (2,3).
        
        const result = attemptMove(pieces, board, pieceId, 2, 3);
        
        expect(result.success).toBe(true);
        const movedPiece = result.pieces.find(p => p.id === pieceId);
        expect(movedPiece.possibilities).toEqual(['N']);
    });
});

/**
 * useGame Hook - Real-time Game State Management
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
    attemptMove,
    getValidMoves,
    checkGameOver,
    createInitialBoard,
} from '../utils/quantumChess';
import { makeAIMove as getBestAIMove } from '../utils/aiLogic';

export function useGame(roomInfo, user) {
    const [gameState, setGameState] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [myColor, setMyColor] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [error, setError] = useState(null);
    const [lastMove, setLastMove] = useState(null);
    const [whiteTime, setWhiteTime] = useState(null);
    const [blackTime, setBlackTime] = useState(null);
    const unsubscribeRef = useRef(null);
    const timerRef = useRef(null);

    // Initialize game state
    useEffect(() => {
        if (!roomInfo) {
            setGameState(null);
            return;
        }

        // Local/offline game OR AI game
        if (roomInfo.isLocal || roomInfo.isAiMatch) {
            const { board, pieces } = createInitialBoard();
            setGameState({
                id: roomInfo.id,
                turn: 0,
                players: roomInfo.players,
                board,
                pieces,
                history: [],
                status: 'active',
                gameOver: null,
            });
            // If AI match, my color is defined in roomInfo, otherwise local assumes white
            setMyColor(roomInfo.myColor || 'white');
            setIsMyTurn(roomInfo.myColor === 'black' ? false : true);

            // Initialize times
            const initialTime = roomInfo.timeControl || 600;
            setWhiteTime(initialTime);
            setBlackTime(initialTime);
            return;
        }

        // Online game - subscribe to Firestore
        if (!isFirebaseConfigured || !db) {
            setError('Firebase not configured');
            return;
        }

        const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomInfo.id);

        unsubscribeRef.current = onSnapshot(roomRef, (snap) => {
            if (!snap.exists()) {
                setError('Room not found');
                return;
            }

            const data = snap.data();
            setGameState(data);

            // Determine my color
            if (data.players.white === user?.uid) {
                setMyColor('white');
                setIsMyTurn(data.turn === 0);
            } else if (data.players.black === user?.uid) {
                setMyColor('black');
                setIsMyTurn(data.turn === 1);
            }

            // Sync times from server
            if (data.whiteTime !== undefined) setWhiteTime(data.whiteTime);
            if (data.blackTime !== undefined) setBlackTime(data.blackTime);

        }, (err) => {
            console.error('[Game] Subscription error:', err);
            setError(err.message);
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [roomInfo, user]);

    // Execute a move (defined first so other callbacks can reference it)
    const makeMove = useCallback(async (toX, toY, explicitPiece = null) => {
        const targetPiece = explicitPiece || selectedPiece;
        if (!targetPiece || !gameState) return;

        const result = attemptMove(
            gameState.pieces,
            gameState.board,
            targetPiece.id,
            toX,
            toY
        );

        if (!result.success) {
            console.log('[Game] Invalid move:', result.message);
            return;
        }

        // Check for game over
        const winner = checkGameOver(result.pieces);

        // Calculate new times
        let newWhiteTime = whiteTime;
        let newBlackTime = blackTime;

        // If speed chess, reset time for the player who just moved
        if (roomInfo?.mode === 'speed') {
            if (gameState.turn === 0) newWhiteTime = 10;
            else newBlackTime = 10;
        }

        const newState = {
            ...gameState,
            pieces: result.pieces,
            board: result.board,
            turn: gameState.turn === 0 ? 1 : 0,
            whiteTime: newWhiteTime,
            blackTime: newBlackTime,
            history: [
                ...gameState.history,
                {
                    pieceId: targetPiece.id,
                    from: { x: targetPiece.x, y: targetPiece.y },
                    to: { x: toX, y: toY },
                    captured: result.capturedPiece?.id ?? null,
                    timestamp: Date.now(),
                }
            ],
            status: winner ? 'finished' : 'active',
            gameOver: winner,
        };

        setLastMove({ from: { x: targetPiece.x, y: targetPiece.y }, to: { x: toX, y: toY } });
        setSelectedPiece(null);
        setValidMoves([]);

        // Update state
        if (roomInfo?.isLocal || roomInfo?.isAiMatch) {
            // Local game or AI Match - just update state
            setGameState(newState);

            // Turn handling
            if (roomInfo.isLocal) {
                setIsMyTurn(newState.turn === 0); // Always play as white locally
                // Simple AI for black (legacy local mode)
                if (!winner && newState.turn === 1) {
                    setTimeout(() => {
                        makeLocalRandomMove(newState);
                    }, 800);
                }
            } else {
                // AI Match (Auto-Match)
                const nextIsMyTurn = (newState.turn === 0 && myColor === 'white') ||
                    (newState.turn === 1 && myColor === 'black');
                setIsMyTurn(nextIsMyTurn);
            }
        } else if (isFirebaseConfigured && db) {
            // Online game - sync to Firestore
            try {
                const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomInfo.id);
                await updateDoc(roomRef, {
                    pieces: newState.pieces,
                    board: newState.board,
                    turn: newState.turn,
                    whiteTime: newState.whiteTime,
                    blackTime: newState.blackTime,
                    history: newState.history,
                    status: newState.status,
                    gameOver: newState.gameOver,
                    updatedAt: serverTimestamp(),
                });
            } catch (e) {
                console.error('[Game] Update error:', e);
                setError(e.message);
            }
        }
    }, [selectedPiece, gameState, roomInfo, whiteTime, blackTime, myColor]);

    // Handle piece selection (now can reference makeMove)
    const selectPiece = useCallback((piece) => {
        if (!gameState || !isMyTurn) return;

        const myTeam = myColor === 'white' ? 0 : 1;

        if (piece.team !== myTeam) {
            // Clicked opponent piece - if we have a selection, try to capture
            if (selectedPiece) {
                const targetMove = validMoves.find(m => m.x === piece.x && m.y === piece.y);
                if (targetMove) {
                    makeMove(piece.x, piece.y);
                }
            }
            return;
        }

        // Select our piece
        setSelectedPiece(piece);
        const moves = getValidMoves(piece, gameState.board, gameState.pieces);
        setValidMoves(moves);
    }, [gameState, isMyTurn, myColor, selectedPiece, validMoves, makeMove]);

    // Handle square click (for moving)
    const clickSquare = useCallback((x, y) => {
        if (!selectedPiece || !isMyTurn) return;

        const move = validMoves.find(m => m.x === x && m.y === y);
        if (move) {
            makeMove(x, y);
        } else {
            // Deselect
            setSelectedPiece(null);
            setValidMoves([]);
        }
    }, [selectedPiece, isMyTurn, validMoves, makeMove]);

    // Simple AI for local games (legacy/random)
    const makeLocalRandomMove = useCallback((state) => {
        const blackPieces = state.pieces.filter(p => p.team === 1 && !p.captured);
        for (const piece of blackPieces.sort(() => Math.random() - 0.5)) {
            const moves = getValidMoves(piece, state.board, state.pieces);
            if (moves.length > 0) {
                const move = moves[Math.floor(Math.random() * moves.length)];
                const result = attemptMove(state.pieces, state.board, piece.id, move.x, move.y);
                if (result.success) {
                    const winner = checkGameOver(result.pieces);
                    setLastMove({ from: { x: piece.x, y: piece.y }, to: { x: move.x, y: move.y } });
                    setGameState({
                        ...state,
                        pieces: result.pieces,
                        board: result.board,
                        turn: 0,
                        history: [...state.history, {
                            pieceId: piece.id,
                            from: { x: piece.x, y: piece.y },
                            to: { x: move.x, y: move.y },
                            captured: result.capturedPiece?.id ?? null,
                            timestamp: Date.now(),
                        }],
                        status: winner ? 'finished' : 'active',
                        gameOver: winner,
                    });
                    setIsMyTurn(true);
                    return;
                }
            }
        }
    }, []);

    // Resign game
    const resign = useCallback(async () => {
        if (!gameState) return;

        const winner = myColor === 'white' ? 'BLACK' : 'WHITE';

        if (roomInfo?.isLocal) {
            setGameState({ ...gameState, status: 'finished', gameOver: winner });
        } else if (isFirebaseConfigured && db) {
            try {
                const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomInfo.id);
                await updateDoc(roomRef, {
                    status: 'finished',
                    gameOver: winner,
                    updatedAt: serverTimestamp(),
                });
            } catch (e) {
                setError(e.message);
            }
        }
    }, [gameState, myColor, roomInfo]);

    // AI Opponent Logic (Smarter AI for Auto-Match)
    useEffect(() => {
        if (!roomInfo?.isAiMatch || !gameState || gameState.gameOver || isMyTurn) return;

        const aiTurn = async () => {
            // Determine AI team (opponent of myColor)
            const aiTeam = myColor === 'white' ? 1 : 0;

            // Wait and get AI move from intelligent logic
            const move = await getBestAIMove(gameState.board, gameState.pieces, aiTeam);

            if (move) {
                // Execute move locally using the refactored makeMove
                makeMove(move.to.x, move.to.y, move.piece);
            } else {
                console.log('[AI] No moves available');
                // Could force resign or stalemate here
            }
        };

        aiTurn();
    }, [roomInfo, gameState, isMyTurn, myColor, makeMove]);

    // Timer Logic
    useEffect(() => {
        if (!gameState || gameState.status !== 'active' || gameState.gameOver) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            if (gameState.turn === 0) {
                setWhiteTime(prev => {
                    const next = Math.max(0, (prev || 0) - 1);
                    if (next === 0 && myColor === 'white') handleTimeout('white'); // Only 'owner' handles timeout
                    else if (next === 0 && roomInfo.isLocal) handleTimeout('white');
                    return next;
                });
            } else {
                setBlackTime(prev => {
                    const next = Math.max(0, (prev || 0) - 1);
                    if (next === 0 && myColor === 'black') handleTimeout('black');
                    else if (next === 0 && roomInfo.isLocal) handleTimeout('black');
                    return next;
                });
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState?.status, gameState?.turn, gameState?.gameOver, myColor, roomInfo]);

    const handleTimeout = useCallback(async (color) => {
        const winner = color === 'white' ? 'BLACK' : 'WHITE';
        const reason = 'TIMEOUT';

        if (roomInfo?.isLocal || roomInfo?.isAiMatch) {
            setGameState(prev => ({ ...prev, status: 'finished', gameOver: winner, winReason: reason }));
        } else if (isFirebaseConfigured && db) {
            try {
                const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomInfo.id);
                await updateDoc(roomRef, {
                    status: 'finished',
                    gameOver: winner,
                    winReason: reason,
                    updatedAt: serverTimestamp(),
                });
            } catch (e) {
                console.error('[Game] Timeout update error:', e);
            }
        }
    }, [roomInfo, gameState]);

    return {
        gameState,
        selectedPiece,
        validMoves,
        myColor,
        isMyTurn,
        error,
        lastMove,
        whiteTime,
        blackTime,
        selectPiece,
        clickSquare,
        resign,
    };
}

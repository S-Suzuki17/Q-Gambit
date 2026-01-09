/**
 * useQuickChat Hook - In-game Quick Chat
 * Sends and receives preset chat messages during games
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { db, isFirebaseConfigured, appId } from '../config/firebase';
import { doc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';

const CHAT_MESSAGES = [
    { id: 'gg', text: 'グッドゲーム！', emoji: '🤝' },
    { id: 'nice', text: 'ナイス！', emoji: '👏' },
    { id: 'wow', text: 'すごい！', emoji: '😮' },
    { id: 'think', text: '考え中...', emoji: '🤔' },
    { id: 'hurry', text: '急いで！', emoji: '⏰' },
    { id: 'gl', text: 'グッドラック！', emoji: '🍀' },
];

const CHAT_DISPLAY_DURATION = 3000; // 3 seconds

export function useQuickChat(roomId, myColor) {
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [displayMessage, setDisplayMessage] = useState(null);
    const timeoutRef = useRef(null);

    // Subscribe to chat messages
    useEffect(() => {
        if (!roomId || !isFirebaseConfigured || !db) return;

        const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);

        const unsubscribe = onSnapshot(roomRef, (snap) => {
            const data = snap.data();
            if (data?.chat) {
                const latestMessage = data.chat[data.chat.length - 1];
                if (latestMessage && latestMessage.color !== myColor) {
                    // Show opponent's message
                    setDisplayMessage(latestMessage);

                    // Clear previous timeout
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }

                    // Auto-hide after duration
                    timeoutRef.current = setTimeout(() => {
                        setDisplayMessage(null);
                    }, CHAT_DISPLAY_DURATION);
                }
                setReceivedMessages(data.chat);
            }
        });

        return () => {
            unsubscribe();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [roomId, myColor]);

    // Send a chat message
    const sendMessage = useCallback(async (messageId) => {
        if (!roomId || !isFirebaseConfigured || !db) return;

        const message = CHAT_MESSAGES.find(m => m.id === messageId);
        if (!message) return;

        try {
            const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
            await updateDoc(roomRef, {
                chat: arrayUnion({
                    id: messageId,
                    text: message.text,
                    emoji: message.emoji,
                    color: myColor,
                    timestamp: Date.now(),
                }),
            });
        } catch (e) {
            console.error('[QuickChat] Send error:', e);
        }
    }, [roomId, myColor]);

    return {
        messages: CHAT_MESSAGES,
        receivedMessages,
        displayMessage,
        sendMessage,
        clearDisplay: () => setDisplayMessage(null),
    };
}
